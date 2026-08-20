import "server-only";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { reminderEmail } from "./email-templates";
import { hoursUntilSA } from "./timezone";
import { googleCalendarUrl } from "./calendar";
import { createManageBookingToken, manageBookingUrl } from "./tokens";

const BOOKING_INCLUDE = { service: true, addOns: { include: { service: true } } } as const;

async function sendReminderFor(
  booking: {
    id: string;
    reference: string;
    clientEmail: string;
    requestedDate: string;
    requestedTime: string;
    service: { name: string; durationMinutes: number };
    addOns: { service: { durationMinutes: number } }[];
  },
  type: "24H" | "2H",
  message: string,
  settings: { businessName: string; whatsapp: string; address: string; addressPublic: boolean }
) {
  const duration = booking.service.durationMinutes + booking.addOns.reduce((s, a) => s + (a.service.durationMinutes || 0), 0);
  const rawToken = await createManageBookingToken(booking.id, 7);

  await sendEmail({
    to: booking.clientEmail,
    bookingId: booking.id,
    ...reminderEmail({
      businessName: settings.businessName,
      reference: booking.reference,
      serviceName: booking.service.name,
      date: booking.requestedDate,
      time: booking.requestedTime,
      message,
      address: settings.addressPublic ? settings.address : undefined,
      whatsapp: settings.whatsapp,
      calendarUrl: googleCalendarUrl({
        title: `Nailed It Jess — ${booking.service.name}`,
        description: `Booking reference ${booking.reference}`,
        date: booking.requestedDate,
        time: booking.requestedTime,
        durationMinutes: duration,
      }),
      manageUrl: manageBookingUrl(rawToken),
    }),
  });

  try {
    await prisma.reminderLog.create({ data: { bookingId: booking.id, type, status: "SENT" } });
  } catch {
    // Unique(bookingId, type) — a concurrent run already logged this reminder; the email above may
    // double-send in a rare race, but no duplicate log entry (and no duplicate future reminder) results.
  }
}

/**
 * Finds CONFIRMED bookings due for a 24-hour or 2-hour reminder and sends
 * them. Safe to call repeatedly (e.g. from an hourly cron) — ReminderLog's
 * unique (bookingId, type) constraint prevents duplicates. Only CONFIRMED
 * bookings are eligible, which naturally excludes cancelled, declined,
 * completed, no-show, and not-yet-confirmed/expired-proposal bookings.
 */
export async function sendDueReminders() {
  const settings = await prisma.businessSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  const result = { checked: 0, sent24h: 0, sent2h: 0, skipped: 0 };
  if (!settings.remindersEnabled) return result;

  const confirmed = await prisma.booking.findMany({
    where: { status: "CONFIRMED" },
    include: { ...BOOKING_INCLUDE, reminderLogs: true },
  });
  result.checked = confirmed.length;

  for (const booking of confirmed) {
    const hours = hoursUntilSA(booking.requestedDate, booking.requestedTime);
    if (hours <= 0) continue; // appointment already passed

    const sentTypes = new Set(booking.reminderLogs.map((r) => r.type));

    if (settings.remind24hEnabled && hours <= 24 && !sentTypes.has("24H")) {
      await sendReminderFor(booking, "24H", settings.remind24hMessage, settings);
      result.sent24h++;
    } else if (settings.remind2hEnabled && hours <= 2 && !sentTypes.has("2H")) {
      await sendReminderFor(booking, "2H", settings.remind2hMessage, settings);
      result.sent2h++;
    } else {
      result.skipped++;
    }
  }

  return result;
}

/** Admin-triggered resend of one specific reminder (e.g. after a delivery failure). */
export async function resendReminder(bookingId: string, type: "24H" | "2H") {
  const settings = await prisma.businessSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: BOOKING_INCLUDE });
  if (!booking) throw new Error("Booking not found.");

  await prisma.reminderLog.deleteMany({ where: { bookingId, type } });
  const message = type === "24H" ? settings.remind24hMessage : settings.remind2hMessage;
  await sendReminderFor(booking, type, message, settings);
}
