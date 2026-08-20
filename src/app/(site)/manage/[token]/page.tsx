import type { Metadata } from "next";
import { getBookingForToken } from "@/lib/tokens";
import { getSettings } from "@/lib/settings";
import { formatRand } from "@/lib/pricing";
import { googleCalendarUrl } from "@/lib/calendar";
import { BOOKING_STATUS_LABELS, DEPOSIT_STATUS_LABELS, type BookingStatus, type DepositStatus } from "@/lib/types";
import { CANCELLABLE_STATUSES } from "@/lib/booking-actions";
import { Card, Badge } from "@/components/ui/Card";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ProposalResponseButtons, CancelBookingButton } from "@/components/booking/ManageBookingClient";
import { bookingStatusTone, depositStatusTone } from "@/lib/status-tone";

export const metadata: Metadata = { title: "Manage Your Booking — Nailed It Jess" };
export const dynamic = "force-dynamic";

export default async function ManageBookingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [booking, settings] = await Promise.all([getBookingForToken(token), getSettings()]);

  if (!booking) {
    return (
      <section className="mx-auto max-w-lg px-4 md:px-8 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-black mb-4">Link Invalid or Expired</h1>
        <p className="text-medium-grey mb-6">
          This booking-management link is no longer valid. Please contact Nailed It Jess directly for help with your appointment.
        </p>
        <WhatsAppButton whatsapp={settings.whatsapp} />
      </section>
    );
  }

  const status = booking.status as BookingStatus;
  const proposalExpired = booking.proposalExpiresAt ? booking.proposalExpiresAt < new Date() : false;
  const canCancel = CANCELLABLE_STATUSES.includes(status);
  const duration = booking.service.durationMinutes + booking.addOns.reduce((s, a) => s + (a.service.durationMinutes || 0), 0);
  const calendarUrl = googleCalendarUrl({
    title: `Nailed It Jess — ${booking.service.name}`,
    description: `Booking reference ${booking.reference}`,
    date: booking.requestedDate,
    time: booking.requestedTime,
    durationMinutes: duration,
  });

  return (
    <section className="mx-auto max-w-2xl px-4 md:px-8 py-16">
      <div className="text-center mb-8">
        <span className="text-xs tracking-[0.3em] uppercase text-medium-grey">Manage My Booking</span>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-black mt-2">{booking.reference}</h1>
      </div>

      <Card className="p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex gap-2">
            <Badge tone={bookingStatusTone(status)}>{BOOKING_STATUS_LABELS[status]}</Badge>
            {booking.depositStatus !== "NOT_REQUIRED" && (
              <Badge tone={depositStatusTone(booking.depositStatus as DepositStatus)}>
                {DEPOSIT_STATUS_LABELS[booking.depositStatus as DepositStatus]}
              </Badge>
            )}
          </div>
        </div>

        {status === "PROPOSED_NEW_TIME" && !proposalExpired && (
          <div className="mb-8 bg-bg border border-marble rounded-lg p-5">
            <h2 className="font-display text-lg font-semibold text-black mb-2">A New Time Has Been Proposed</h2>
            <p className="text-sm text-charcoal mb-1">
              Originally requested: {booking.requestedDate} at {booking.requestedTime}
            </p>
            <p className="text-sm text-charcoal mb-3">
              Proposed: <strong>{booking.proposedDate} at {booking.proposedTime}</strong>
            </p>
            {booking.proposalMessage && <p className="text-sm italic text-charcoal mb-4">&ldquo;{booking.proposalMessage}&rdquo;</p>}
            <ProposalResponseButtons token={token} />
            {booking.proposalExpiresAt && (
              <p className="text-xs text-medium-grey mt-3">Please respond before {new Date(booking.proposalExpiresAt).toLocaleString()}.</p>
            )}
          </div>
        )}

        {status === "PROPOSED_NEW_TIME" && proposalExpired && (
          <div className="mb-8 bg-warning/10 border border-warning/30 rounded-lg p-5 text-sm text-charcoal">
            This proposed time has expired. Please contact Nailed It Jess to check availability.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xs tracking-[0.25em] uppercase text-medium-grey mb-2">Service</h3>
            <p className="text-sm text-charcoal">{booking.service.name}</p>
            {booking.addOns.map((a) => (
              <p key={a.id} className="text-xs text-medium-grey">
                + {a.service.name}
              </p>
            ))}
          </div>
          <div>
            <h3 className="text-xs tracking-[0.25em] uppercase text-medium-grey mb-2">Appointment</h3>
            <p className="text-sm text-charcoal">
              {booking.requestedDate} at {booking.requestedTime}
            </p>
          </div>
        </div>

        <div className="bg-bg border border-marble rounded-lg p-4 text-sm mb-6">
          <div className="flex justify-between py-1">
            <span>Estimated Total</span>
            <span>{formatRand(booking.estimatedTotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Deposit</span>
            <span>{formatRand(booking.depositAmount)}</span>
          </div>
          <div className="flex justify-between py-1 text-medium-grey">
            <span>Remaining Balance</span>
            <span>{formatRand(booking.remainingBalance)}</span>
          </div>
        </div>

        {booking.policyAcceptance && (
          <p className="text-xs text-medium-grey mb-6">
            Policies version {booking.policyAcceptance.policyVersion} accepted {new Date(booking.policyAcceptance.acceptedAt).toLocaleString()}.
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-4 border-t border-marble">
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-sm border border-black px-4 py-2 text-sm">
            Add to Calendar
          </a>
          <WhatsAppButton whatsapp={settings.whatsapp} variant="outline" message={`Hi Jess! I'd like to ask about my booking ${booking.reference}.`} />
          {canCancel && <CancelBookingButton token={token} />}
        </div>
      </Card>
    </section>
  );
}
