import "server-only";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import {
  acceptedAwaitingDepositEmail,
  cancellationEmail,
  confirmedEmail,
  declinedEmail,
  noShowEmail,
  proposedNewTimeEmail,
} from "./email-templates";
import { formatRand } from "./pricing";
import { findConflict, BookingError } from "./booking-service";

async function getBookingOrThrow(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: true, client: true, addOns: { include: { service: true } } },
  });
  if (!booking) throw new BookingError("Booking not found.", 404);
  return booking;
}

async function getSettings() {
  return prisma.businessSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

export async function acceptBooking(id: string) {
  const booking = await getBookingOrThrow(id);
  const settings = await getSettings();

  const duration = booking.service.durationMinutes + booking.addOns.reduce((s, a) => s + (a.service.durationMinutes || 0), 0);
  const conflict = await findConflict(booking.requestedDate, booking.requestedTime, duration, booking.id);
  if (conflict) {
    throw new BookingError(
      `This time overlaps with an existing booking (${conflict.reference}). Propose a different time instead.`,
      409
    );
  }

  const requiresDeposit = booking.depositAmount > 0;
  const newStatus = requiresDeposit ? "ACCEPTED_AWAITING_DEPOSIT" : "CONFIRMED";
  const newDepositStatus = requiresDeposit ? "AWAITING_DEPOSIT" : "NOT_REQUIRED";

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: newStatus, depositStatus: newDepositStatus },
    include: { service: true },
  });

  if (requiresDeposit) {
    await sendEmail({
      to: booking.clientEmail,
      bookingId: booking.id,
      ...acceptedAwaitingDepositEmail({
        businessName: settings.businessName,
        reference: booking.reference,
        serviceName: booking.service.name,
        date: booking.requestedDate,
        time: booking.requestedTime,
        depositAmount: formatRand(booking.depositAmount),
        remainingBalance: formatRand(booking.remainingBalance),
        totalAmount: formatRand(booking.estimatedTotal),
        eftDetails: settings.eftDetails,
      }),
    });
  } else {
    await sendEmail({
      to: booking.clientEmail,
      bookingId: booking.id,
      ...confirmedEmail({
        businessName: settings.businessName,
        reference: booking.reference,
        serviceName: booking.service.name,
        date: booking.requestedDate,
        time: booking.requestedTime,
      }),
    });
  }

  return updated;
}

export async function proposeNewTime(id: string, date: string, time: string) {
  const booking = await getBookingOrThrow(id);
  const settings = await getSettings();

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "PROPOSED_NEW_TIME", proposedDate: date, proposedTime: time },
  });

  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...proposedNewTimeEmail({
      businessName: settings.businessName,
      reference: booking.reference,
      serviceName: booking.service.name,
      proposedDate: date,
      proposedTime: time,
    }),
  });

  return updated;
}

export async function declineBooking(id: string, reason?: string) {
  const booking = await getBookingOrThrow(id);
  const settings = await getSettings();

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "DECLINED", adminNotes: reason ? `${booking.adminNotes}\nDeclined: ${reason}`.trim() : booking.adminNotes },
  });

  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...declinedEmail({
      businessName: settings.businessName,
      reference: booking.reference,
      serviceName: booking.service.name,
      reason,
    }),
  });

  return updated;
}

export async function recordDeposit(id: string, depositStatus: string, method?: string) {
  const booking = await getBookingOrThrow(id);
  const settings = await getSettings();

  const data: Record<string, unknown> = {
    depositStatus,
    depositMethod: method ?? booking.depositMethod,
  };

  if (depositStatus === "DEPOSIT_PAID") {
    data.depositRecordedAt = new Date();
    data.status = "CONFIRMED";
  }

  const updated = await prisma.booking.update({ where: { id }, data });

  if (depositStatus === "DEPOSIT_PAID") {
    await sendEmail({
      to: booking.clientEmail,
      bookingId: booking.id,
      ...confirmedEmail({
        businessName: settings.businessName,
        reference: booking.reference,
        serviceName: booking.service.name,
        date: booking.requestedDate,
        time: booking.requestedTime,
      }),
    });
  }

  return updated;
}

function hoursUntil(date: string, time: string) {
  const target = new Date(`${date}T${time}:00`);
  return (target.getTime() - Date.now()) / (1000 * 60 * 60);
}

/**
 * Shared cancellation/no-show fee logic. The business requires a 50% deposit
 * and separately describes a 50% late-cancellation fee — this computes the
 * outcome without double-charging, per the admin's configured
 * cancellationFeeMode (default: a forfeited deposit satisfies the fee).
 */
async function applyLateCancellationOutcome(
  bookingId: string,
  status: "CANCELLED" | "NO_SHOW",
  reason?: string
) {
  const booking = await getBookingOrThrow(bookingId);
  const settings = await getSettings();

  const isLate = status === "NO_SHOW" || hoursUntil(booking.requestedDate, booking.requestedTime) < settings.lateCancellationHours;
  const depositWasPaid = booking.depositStatus === "DEPOSIT_PAID";

  const data: Record<string, unknown> = {
    status,
    cancellationReason: reason ?? booking.cancellationReason,
  };

  let feeMessage: string;

  if (!isLate) {
    data.cancellationFeeStatus = "NONE";
    feeMessage = "This cancellation was made outside the late-cancellation window, so no fee applies.";
  } else {
    if (depositWasPaid) {
      data.depositStatus = "DEPOSIT_FORFEITED";
    }

    const lateFeeAmount = Math.round((booking.estimatedTotal * settings.lateCancellationFeePercentage) / 100);

    if (settings.cancellationFeeMode === "MANUAL_REVIEW") {
      data.cancellationFeeStatus = "MANUAL_REVIEW";
      feeMessage =
        "This booking has been flagged for manual review to determine any applicable cancellation fee. Nailed It Jess will be in touch.";
    } else if (depositWasPaid && settings.cancellationFeeMode === "FORFEIT_SATISFIES") {
      data.cancellationFeeStatus = "SATISFIED_BY_DEPOSIT";
      feeMessage = `As this was a late cancellation, the ${formatRand(booking.depositAmount)} deposit already paid has been forfeited and satisfies the late-cancellation fee. No further amount is due.`;
    } else {
      data.cancellationFeeStatus = "ADDITIONAL_FEE_DUE";
      data.cancellationFeeAmount = lateFeeAmount;
      feeMessage = depositWasPaid
        ? `As this was a late cancellation, the ${formatRand(booking.depositAmount)} deposit already paid has been forfeited. An additional cancellation fee of ${formatRand(lateFeeAmount)} (${settings.lateCancellationFeePercentage}% of the appointment total) is due by EFT before another appointment can be booked.`
        : `As this was a late cancellation, a fee of ${formatRand(lateFeeAmount)} (${settings.lateCancellationFeePercentage}% of the appointment total) is due by EFT before another appointment can be booked.`;
    }
  }

  const updated = await prisma.booking.update({ where: { id: bookingId }, data });
  return { booking: updated, feeMessage, settings, original: booking };
}

export async function cancelBooking(id: string, reason?: string) {
  const { booking, feeMessage, settings } = await applyLateCancellationOutcome(id, "CANCELLED", reason);
  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...cancellationEmail({ businessName: settings.businessName, reference: booking.reference, feeMessage }),
  });
  return booking;
}

export async function markNoShow(id: string, restrictClient: boolean, restrictionReason?: string) {
  const { booking, feeMessage, settings, original } = await applyLateCancellationOutcome(id, "NO_SHOW");

  if (restrictClient) {
    await prisma.client.update({
      where: { id: original.clientId },
      data: { restricted: true, restrictionReason: restrictionReason || "No-show with outstanding cancellation fee." },
    });
  }

  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...noShowEmail({ businessName: settings.businessName, reference: booking.reference, feeMessage, restricted: restrictClient }),
  });

  return booking;
}

export async function markCompleted(id: string) {
  return prisma.booking.update({ where: { id }, data: { status: "COMPLETED" } });
}
