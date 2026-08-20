import "server-only";
import type { BookingSummaryContext } from "./email-templates";
import { formatRand } from "./pricing";
import { DEPOSIT_STATUS_LABELS, type DepositStatus } from "./types";
import { googleCalendarUrl } from "./calendar";
import { createManageBookingToken, manageBookingUrl } from "./tokens";

type BookingWithRelations = {
  reference: string;
  clientName: string;
  requestedDate: string;
  requestedTime: string;
  serviceSubtotal: number;
  addOnsTotal: number;
  estimatedTotal: number;
  depositAmount: number;
  depositStatus: string;
  remainingBalance: number;
  service: { name: string; durationMinutes: number };
  addOns: { nailCount: number | null; calculatedPrice: number; service: { name: string; durationMinutes: number } }[];
};

type SettingsForEmail = {
  businessName: string;
  whatsapp: string;
  instagram: string;
  address: string;
  addressPublic: boolean;
  prepareForAppointmentText: string;
  lateCancellationHours: number;
  lateCancellationFeePercentage: number;
};

/** Builds the shared "full booking summary" context used across confirmation-type emails, including a fresh manage-booking link. */
export async function buildSummaryContext(
  booking: BookingWithRelations & { id: string },
  settings: SettingsForEmail,
  opts: { includeAddress?: boolean } = {}
): Promise<BookingSummaryContext> {
  const durationMinutes = booking.service.durationMinutes + booking.addOns.reduce((s, a) => s + (a.service.durationMinutes || 0), 0);

  const rawToken = await createManageBookingToken(booking.id);

  return {
    clientName: booking.clientName,
    reference: booking.reference,
    serviceName: booking.service.name,
    addOnLines: booking.addOns.map((a) => `${a.service.name}${a.nailCount ? ` (${a.nailCount} nails)` : ""} — ${formatRand(a.calculatedPrice)}`),
    date: booking.requestedDate,
    time: booking.requestedTime,
    durationMinutes,
    serviceSubtotal: formatRand(booking.serviceSubtotal),
    addOnsTotal: formatRand(booking.addOnsTotal),
    estimatedTotal: formatRand(booking.estimatedTotal),
    depositAmount: formatRand(booking.depositAmount),
    depositStatusLabel: DEPOSIT_STATUS_LABELS[booking.depositStatus as DepositStatus] ?? booking.depositStatus,
    remainingBalance: formatRand(booking.remainingBalance),
    address: opts.includeAddress && settings.addressPublic ? settings.address : undefined,
    whatsapp: settings.whatsapp,
    instagram: settings.instagram,
    prepareText: settings.prepareForAppointmentText,
    cancellationSummary: `Cancel at least ${settings.lateCancellationHours} hours ahead to avoid a ${settings.lateCancellationFeePercentage}% fee. Please arrive on time — late arrivals may need to be rescheduled.`,
    calendarUrl: googleCalendarUrl({
      title: `Nailed It Jess — ${booking.service.name}`,
      description: `Booking reference ${booking.reference}`,
      date: booking.requestedDate,
      time: booking.requestedTime,
      durationMinutes,
      location: opts.includeAddress && settings.addressPublic ? settings.address : undefined,
    }),
    manageUrl: manageBookingUrl(rawToken),
  };
}
