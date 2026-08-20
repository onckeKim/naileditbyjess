import "server-only";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import {
  acceptedAwaitingDepositEmail,
  cancellationEmail,
  completedEmail,
  confirmedEmail,
  declinedEmail,
  depositRecordedEmail,
  noShowEmail,
  notifyArtistProposalRespondedEmail,
  proposalAcceptedEmail,
  proposalDeclinedEmail,
  proposedNewTimeEmail,
  rescheduledEmail,
} from "./email-templates";
import { buildSummaryContext } from "./email-context";
import { formatRand } from "./pricing";
import { findConflict, BookingError } from "./booking-service";
import { hoursUntilSA } from "./timezone";
import { manageBookingUrl, createManageBookingToken } from "./tokens";

const BOOKING_INCLUDE = { service: true, client: true, addOns: { include: { service: true } } } as const;

async function getBookingOrThrow(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id }, include: BOOKING_INCLUDE });
  if (!booking) throw new BookingError("Booking not found.", 404);
  return booking;
}

async function getSettings() {
  return prisma.businessSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

async function recordHistory(bookingId: string, fromStatus: string | null, toStatus: string, changedBy: "ADMIN" | "CLIENT" | "SYSTEM", note?: string) {
  await prisma.bookingStatusHistory.create({ data: { bookingId, fromStatus, toStatus, changedBy, note } });
}

function whatsappHref(number: string, message: string) {
  const digits = number.replace(/[^0-9]/g, "");
  const withCountryCode = digits.startsWith("0") ? `27${digits.slice(1)}` : digits;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

export async function acceptBooking(id: string) {
  const booking = await getBookingOrThrow(id);
  const settings = await getSettings();

  const duration = booking.service.durationMinutes + booking.addOns.reduce((s, a) => s + (a.service.durationMinutes || 0), 0);
  const conflict = await findConflict(booking.requestedDate, booking.requestedTime, duration, booking.id, settings.bufferMinutes);
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
    include: BOOKING_INCLUDE,
  });
  await recordHistory(id, booking.status, newStatus, "ADMIN");

  const ctx = await buildSummaryContext(updated, settings, { includeAddress: false });

  if (requiresDeposit) {
    await sendEmail({
      to: booking.clientEmail,
      bookingId: booking.id,
      ...acceptedAwaitingDepositEmail({ businessName: settings.businessName, eftDetails: settings.eftDetails, ...ctx }),
    });
  } else {
    await sendEmail({
      to: booking.clientEmail,
      bookingId: booking.id,
      ...confirmedEmail(await buildSummaryContext(updated, settings, { includeAddress: true })),
    });
  }

  return updated;
}

export async function proposeNewTime(id: string, date: string, time: string, message?: string) {
  const booking = await getBookingOrThrow(id);
  const settings = await getSettings();

  const expiresAt = new Date(Date.now() + settings.proposalExpiryHours * 60 * 60 * 1000);

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "PROPOSED_NEW_TIME",
      proposedDate: date,
      proposedTime: time,
      proposalMessage: message || null,
      proposalExpiresAt: expiresAt,
    },
  });
  await recordHistory(id, booking.status, "PROPOSED_NEW_TIME", "ADMIN", message);

  // The email's Accept/Decline buttons both land on the same secure,
  // token-gated manage page (a safe GET) rather than triggering the
  // state change directly from the email link — some mail clients and
  // security scanners pre-fetch links, which would otherwise risk an
  // accidental accept. The manage page itself performs the mutating
  // action via an explicit button click (POST).
  const manageUrl = manageBookingUrl(await createManageBookingToken(id));

  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...proposedNewTimeEmail({
      businessName: settings.businessName,
      reference: booking.reference,
      serviceName: booking.service.name,
      requestedDate: booking.requestedDate,
      requestedTime: booking.requestedTime,
      proposedDate: date,
      proposedTime: time,
      message,
      expiresAt: expiresAt.toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }),
      acceptUrl: manageUrl,
      declineUrl: manageUrl,
    }),
  });

  return updated;
}

/**
 * A client accepting or declining a proposed alternative time. Shared by the
 * admin-assisted flow (staff acting on the client's behalf, e.g. over the
 * phone) and the public token-gated /manage page.
 */
export async function respondToProposal(id: string, accept: boolean, changedBy: "ADMIN" | "CLIENT" = "CLIENT") {
  const booking = await getBookingOrThrow(id);
  const settings = await getSettings();

  if (booking.status !== "PROPOSED_NEW_TIME") {
    throw new BookingError("This booking no longer has a pending proposed time.", 409);
  }
  if (booking.proposalExpiresAt && booking.proposalExpiresAt < new Date()) {
    throw new BookingError("This proposed time has expired. Please contact Nailed It Jess to check availability.", 410);
  }
  if (!booking.proposedDate || !booking.proposedTime) {
    throw new BookingError("No proposed time is set on this booking.", 409);
  }

  if (!accept) {
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "PROPOSAL_DECLINED" },
    });
    await recordHistory(id, booking.status, "PROPOSAL_DECLINED", changedBy);

    await sendEmail({
      to: booking.clientEmail,
      bookingId: booking.id,
      ...proposalDeclinedEmail({ businessName: settings.businessName, reference: booking.reference, serviceName: booking.service.name }),
    });
    if (settings.contactEmail) {
      await sendEmail({
        to: settings.contactEmail,
        bookingId: booking.id,
        ...notifyArtistProposalRespondedEmail({
          businessName: settings.businessName,
          reference: booking.reference,
          clientName: booking.clientName,
          accepted: false,
        }),
      });
    }
    return updated;
  }

  const duration = booking.service.durationMinutes + booking.addOns.reduce((s, a) => s + (a.service.durationMinutes || 0), 0);
  const conflict = await findConflict(booking.proposedDate, booking.proposedTime, duration, booking.id, settings.bufferMinutes);
  if (conflict) {
    throw new BookingError("Sorry, this proposed time is no longer available. Please contact Nailed It Jess.", 409);
  }

  const requiresDeposit = booking.depositAmount > 0;
  const newStatus = requiresDeposit ? "ACCEPTED_AWAITING_DEPOSIT" : "CONFIRMED";
  const newDepositStatus = requiresDeposit ? "AWAITING_DEPOSIT" : "NOT_REQUIRED";

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      requestedDate: booking.proposedDate,
      requestedTime: booking.proposedTime,
      proposedDate: null,
      proposedTime: null,
      proposalMessage: null,
      proposalExpiresAt: null,
      status: newStatus,
      depositStatus: newDepositStatus,
    },
    include: BOOKING_INCLUDE,
  });
  await recordHistory(id, booking.status, newStatus, changedBy, "Client accepted the proposed time.");

  const ctx = await buildSummaryContext(updated, settings, { includeAddress: false });
  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...proposalAcceptedEmail(ctx),
  });

  if (requiresDeposit) {
    await sendEmail({
      to: booking.clientEmail,
      bookingId: booking.id,
      ...acceptedAwaitingDepositEmail({ businessName: settings.businessName, eftDetails: settings.eftDetails, ...ctx }),
    });
  }

  if (settings.contactEmail) {
    await sendEmail({
      to: settings.contactEmail,
      bookingId: booking.id,
      ...notifyArtistProposalRespondedEmail({
        businessName: settings.businessName,
        reference: booking.reference,
        clientName: booking.clientName,
        accepted: true,
      }),
    });
  }

  return updated;
}

export async function declineBooking(id: string, reason?: string) {
  const booking = await getBookingOrThrow(id);
  const settings = await getSettings();

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "DECLINED", adminNotes: reason ? `${booking.adminNotes}\nDeclined: ${reason}`.trim() : booking.adminNotes },
  });
  await recordHistory(id, booking.status, "DECLINED", "ADMIN", reason);

  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...declinedEmail({ businessName: settings.businessName, reference: booking.reference, serviceName: booking.service.name, reason }),
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

  const updated = await prisma.booking.update({ where: { id }, data, include: BOOKING_INCLUDE });
  if (depositStatus !== booking.depositStatus) {
    await recordHistory(id, booking.status, updated.status, "ADMIN", `Deposit status: ${depositStatus}`);
  }

  if (depositStatus === "DEPOSIT_PAID") {
    await sendEmail({
      to: booking.clientEmail,
      bookingId: booking.id,
      ...confirmedEmail(await buildSummaryContext(updated, settings, { includeAddress: true })),
    });
  } else if (depositStatus === "DEPOSIT_SUBMITTED") {
    await sendEmail({
      to: booking.clientEmail,
      bookingId: booking.id,
      ...depositRecordedEmail(await buildSummaryContext(updated, settings, { includeAddress: false })),
    });
  }

  return updated;
}

/** Admin directly reschedules an already-confirmed booking (not via the client-facing propose/accept flow). */
export async function rescheduleBooking(id: string, date: string, time: string) {
  const booking = await getBookingOrThrow(id);
  const settings = await getSettings();

  const duration = booking.service.durationMinutes + booking.addOns.reduce((s, a) => s + (a.service.durationMinutes || 0), 0);
  const conflict = await findConflict(date, time, duration, booking.id, settings.bufferMinutes);
  if (conflict) {
    throw new BookingError(`This time overlaps with an existing booking (${conflict.reference}).`, 409);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { requestedDate: date, requestedTime: time },
    include: BOOKING_INCLUDE,
  });
  await recordHistory(id, booking.status, booking.status, "ADMIN", `Rescheduled from ${booking.requestedDate} ${booking.requestedTime} to ${date} ${time}`);

  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...rescheduledEmail(await buildSummaryContext(updated, settings, { includeAddress: true })),
  });

  return updated;
}

function hoursUntil(date: string, time: string) {
  return hoursUntilSA(date, time);
}

/**
 * Shared cancellation/no-show fee logic. The business requires a 50% deposit
 * and separately describes a 50% late-cancellation fee — this computes the
 * outcome without double-charging, per the admin's configured
 * cancellationFeeMode (default: a forfeited deposit satisfies the fee).
 */
export const CANCELLABLE_STATUSES: readonly string[] = [
  "PENDING",
  "ACCEPTED_AWAITING_DEPOSIT",
  "DEPOSIT_SUBMITTED",
  "CONFIRMED",
  "PROPOSED_NEW_TIME",
  "PROPOSAL_DECLINED",
];

async function applyLateCancellationOutcome(
  bookingId: string,
  status: "CANCELLED" | "NO_SHOW",
  reason: string | undefined,
  changedBy: "ADMIN" | "CLIENT"
) {
  const booking = await getBookingOrThrow(bookingId);
  const settings = await getSettings();

  if (status === "CANCELLED" && !CANCELLABLE_STATUSES.includes(booking.status)) {
    throw new BookingError("This booking can no longer be cancelled.", 409);
  }

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
  await recordHistory(bookingId, booking.status, status, changedBy, reason);
  return { booking: updated, feeMessage, settings, original: booking };
}

export async function cancelBooking(id: string, reason?: string, changedBy: "ADMIN" | "CLIENT" = "ADMIN") {
  const { booking, feeMessage, settings } = await applyLateCancellationOutcome(id, "CANCELLED", reason, changedBy);
  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...cancellationEmail({ businessName: settings.businessName, reference: booking.reference, feeMessage }),
  });
  return booking;
}

export async function markNoShow(id: string, restrictClient: boolean, restrictionReason?: string) {
  const { booking, feeMessage, settings, original } = await applyLateCancellationOutcome(id, "NO_SHOW", undefined, "ADMIN");

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
  const booking = await getBookingOrThrow(id);
  const settings = await getSettings();

  const updated = await prisma.booking.update({ where: { id }, data: { status: "COMPLETED" } });
  await recordHistory(id, booking.status, "COMPLETED", "ADMIN");

  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...completedEmail({
      businessName: settings.businessName,
      reference: booking.reference,
      clientName: booking.clientName,
      reviewWhatsAppUrl: whatsappHref(
        settings.whatsapp,
        `Hi Jess! I just had my appointment (${booking.reference}) and would love to leave a review.`
      ),
    }),
  });

  return updated;
}
