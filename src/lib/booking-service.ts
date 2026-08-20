import "server-only";
import { prisma } from "./prisma";
import { generateBookingReference } from "./reference";
import { calculateAddOnPrice, calculateDeposit, calculateMainServicePrice } from "./pricing";
import { sendEmail } from "./email";
import { requestReceivedEmail, notifyArtistNewRequestEmail } from "./email-templates";
import { createManageBookingToken, manageBookingUrl } from "./tokens";
import { hoursUntilSA } from "./timezone";
import type { CreateBookingInput } from "./validation";

export class BookingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function quoteBooking(serviceId: string, addOns: { serviceId: string; mode?: "PER_NAIL" | "FULL_SET"; nailCount?: number }[]) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) throw new BookingError("Selected service is unavailable.", 404);

  const addOnServiceIds = addOns.map((a) => a.serviceId);
  const addOnServices = addOnServiceIds.length
    ? await prisma.service.findMany({ where: { id: { in: addOnServiceIds }, active: true } })
    : [];

  const { price: serviceSubtotal, isEstimate: serviceIsEstimate } = calculateMainServicePrice(service);

  let addOnsTotal = 0;
  let addOnsEstimate = false;
  let nailArtCount = 0;
  const addOnDetails = addOns.map((sel) => {
    const svc = addOnServices.find((s) => s.id === sel.serviceId);
    if (!svc) throw new BookingError("One of the selected add-ons is unavailable.", 404);
    const result = calculateAddOnPrice(svc, sel);
    addOnsTotal += result.price;
    if (result.isEstimate) addOnsEstimate = true;
    if (sel.nailCount) nailArtCount += sel.nailCount;
    return { service: svc, selection: sel, ...result };
  });

  const settings = await prisma.businessSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  const depositPct = service.depositOverridePercentage ?? settings.depositPercentage;
  const estimatedTotal = Math.round((serviceSubtotal + addOnsTotal) * 100) / 100;
  const { deposit, remaining } = calculateDeposit(estimatedTotal, depositPct);

  return {
    service,
    addOnDetails,
    serviceSubtotal,
    addOnsTotal,
    estimatedTotal,
    isEstimate: serviceIsEstimate || addOnsEstimate,
    depositPercentage: depositPct,
    depositAmount: deposit,
    remainingBalance: remaining,
    nailArtCount,
    durationMinutes: service.durationMinutes + addOnDetails.reduce((sum, d) => sum + (d.service.durationMinutes || 0), 0),
  };
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export async function findConflict(date: string, time: string, durationMinutes: number, excludeBookingId?: string, bufferMinutes = 0) {
  const start = timeToMinutes(time) - bufferMinutes;
  const end = start + durationMinutes + bufferMinutes * 2;

  const candidates = await prisma.booking.findMany({
    where: {
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: ["CONFIRMED", "ACCEPTED_AWAITING_DEPOSIT", "DEPOSIT_SUBMITTED"] },
      OR: [{ requestedDate: date }, { proposedDate: date }],
    },
    include: { service: true, addOns: { include: { service: true } } },
  });

  for (const b of candidates) {
    const effDate = b.proposedDate ?? b.requestedDate;
    const effTime = b.proposedTime ?? b.requestedTime;
    if (effDate !== date) continue;
    const bDuration = b.service.durationMinutes + b.addOns.reduce((s, a) => s + (a.service.durationMinutes || 0), 0);
    const bStart = timeToMinutes(effTime);
    const bEnd = bStart + bDuration;
    if (start < bEnd && bStart < end) return b;
  }
  return null;
}

export async function createBookingRequest(input: CreateBookingInput) {
  const settings = await prisma.businessSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  if (!settings.bookingEnabled) {
    throw new BookingError(
      "Online booking is not yet open. Please contact Nailed It Jess directly via WhatsApp to arrange an appointment.",
      403
    );
  }

  const hoursUntilAppointment = hoursUntilSA(input.requestedDate, input.requestedTime);
  if (hoursUntilAppointment < settings.minNoticeHours) {
    throw new BookingError(`Please choose a time at least ${settings.minNoticeHours} hours from now.`, 422);
  }
  if (hoursUntilAppointment > settings.maxAdvanceDays * 24) {
    throw new BookingError(`Please choose a date within the next ${settings.maxAdvanceDays} days.`, 422);
  }

  const blocked = await prisma.blockedDate.findUnique({ where: { date: input.requestedDate } });
  if (blocked) {
    throw new BookingError("This date is unavailable. Please choose a different date.", 422);
  }

  const client = await prisma.client.upsert({
    where: { email: input.clientEmail.toLowerCase() },
    update: { name: input.clientName, phone: input.clientPhone },
    create: {
      name: input.clientName,
      email: input.clientEmail.toLowerCase(),
      phone: input.clientPhone,
    },
  });

  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const duplicate = await prisma.booking.findFirst({
    where: {
      clientId: client.id,
      serviceId: input.serviceId,
      requestedDate: input.requestedDate,
      requestedTime: input.requestedTime,
      createdAt: { gte: twoMinutesAgo },
    },
  });
  if (duplicate) {
    throw new BookingError(
      `You've already submitted this request (reference ${duplicate.reference}) — check your email, or wait a moment before submitting again.`,
      409
    );
  }

  if (client.restricted) {
    throw new BookingError(
      "We're unable to process online bookings for this client at the moment. Please contact Nailed It Jess directly via WhatsApp.",
      403
    );
  }

  const quote = await quoteBooking(input.serviceId, input.addOns);

  let reference = generateBookingReference();
  for (let i = 0; i < 5; i++) {
    const existing = await prisma.booking.findUnique({ where: { reference } });
    if (!existing) break;
    reference = generateBookingReference();
  }

  const consentText =
    "I have reviewed and agree to the Nailed It Jess deposit, cancellation, no-show, and appointment policies.";

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        reference,
        clientId: client.id,
        serviceId: quote.service.id,
        requestedDate: input.requestedDate,
        requestedTime: input.requestedTime,
        status: "PENDING",
        depositStatus: "NOT_REQUIRED",
        nailArtCount: quote.nailArtCount || null,
        serviceSubtotal: quote.serviceSubtotal,
        addOnsTotal: quote.addOnsTotal,
        estimatedTotal: quote.estimatedTotal,
        depositAmount: quote.depositAmount,
        remainingBalance: quote.remainingBalance,
        clientName: input.clientName,
        clientEmail: input.clientEmail.toLowerCase(),
        clientPhone: input.clientPhone,
        designNotes: input.designNotes || "",
        inspirationImageUrl: input.inspirationImageUrl || null,
        addOns: {
          create: quote.addOnDetails.map((d) => ({
            serviceId: d.service.id,
            nailCount: d.selection.nailCount ?? null,
            calculatedPrice: d.price,
          })),
        },
        policyAcceptance: {
          create: {
            clientId: client.id,
            policyVersion: settings.policyVersion,
            consentText,
          },
        },
        statusHistory: {
          create: { fromStatus: null, toStatus: "PENDING", changedBy: "SYSTEM" },
        },
      },
      include: { service: true, addOns: { include: { service: true } }, policyAcceptance: true },
    });
    return created;
  });

  const rawToken = await createManageBookingToken(booking.id);

  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...requestReceivedEmail({
      businessName: settings.businessName,
      reference: booking.reference,
      serviceName: booking.service.name,
      date: booking.requestedDate,
      time: booking.requestedTime,
      manageUrl: manageBookingUrl(rawToken),
    }),
  });

  if (settings.contactEmail) {
    await sendEmail({
      to: settings.contactEmail,
      bookingId: booking.id,
      ...notifyArtistNewRequestEmail({
        businessName: settings.businessName,
        reference: booking.reference,
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        serviceName: booking.service.name,
        date: booking.requestedDate,
        time: booking.requestedTime,
      }),
    });
  }

  return booking;
}
