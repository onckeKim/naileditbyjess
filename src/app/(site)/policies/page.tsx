import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { FrostedCard } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Booking Policies — Nailed It Jess" };
export const dynamic = "force-dynamic";

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#111111" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  calendar: "M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  percent: "M6 18 18 6M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  cancel: "M12 3v9m0 4v.01M4.9 4.9l14.2 14.2",
  clock: "M12 7v5l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  ghost: "M12 3a7 7 0 0 0-7 7v9l2.5-2 2.5 2 2-2 2 2 2.5-2 2.5 2v-9a7 7 0 0 0-7-7ZM9 12h.01M15 12h.01",
  reschedule: "M4 4v5h5M20 20v-5h-5M20 9A8 8 0 0 0 6.3 6.3L4 9M4 15a8 8 0 0 0 13.7 2.7L20 15",
  timer: "M12 8v4l2.5 2.5M9 3h6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  soak: "M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z",
  brush: "M9 15l6-6m0 0 3-3 3 3-3 3m-3-3-6 6-3 6 6-3Z",
  card: "M3 7h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Zm0 0a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1M3 11h18",
  repair: "M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z",
  guests: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c0-3 3-5 6-5s6 2 6 5M13 15.5c2.5.3 5 2.2 5 4.5",
  health: "M12 21s-7-4.35-9.5-8.5C.7 8.8 2.5 5 6 5c2 0 3.5 1.2 4 2.5C10.5 6.2 12 5 14 5c3.5 0 5.3 3.8 3.5 7.5C15 16.65 12 21 12 21ZM9 10h6M12 7v6",
};

export default async function PoliciesPage() {
  const settings = await getSettings();

  const feeModeText: Record<string, string> = {
    FORFEIT_SATISFIES: "the forfeited deposit satisfies the late-cancellation fee — no further amount is charged",
    ADDITIONAL_FEE: "the forfeited deposit does not cover the late-cancellation fee, and an additional amount may be due",
    MANUAL_REVIEW: "any additional amount due is determined on a case-by-case basis by Nailed It Jess",
  };

  const cards = [
    {
      icon: ICONS.calendar,
      title: "Appointment Requests",
      text: "Submitting a booking request does not automatically confirm your appointment. Your booking is only confirmed once your request has been accepted and you receive a confirmation email.",
    },
    {
      icon: ICONS.percent,
      title: `${settings.depositPercentage}% Deposit`,
      text: `A ${settings.depositPercentage}% deposit of the service total is required to secure every appointment. Your booking is not fully secured until the required deposit has been recorded or paid. The remaining balance may be paid by EFT or card on the day.`,
    },
    {
      icon: ICONS.cancel,
      title: "Cancellations",
      text: "Cancellations must be made at least 24 hours before your scheduled appointment. Cancellations made in good time carry no fee.",
    },
    {
      icon: ICONS.timer,
      title: "Late Cancellations",
      text: `Cancellations made within ${settings.lateCancellationHours} hours of the appointment may result in a fee of ${settings.lateCancellationFeePercentage}% of the appointment total. Where a deposit has already been paid, ${feeModeText[settings.cancellationFeeMode]}. Applicable fees must be paid by EFT before another appointment can be scheduled.`,
    },
    {
      icon: ICONS.ghost,
      title: "No-Shows",
      text: "Failure to arrive for a scheduled appointment is treated the same as a late cancellation, including forfeiture of any deposit paid. Repeated no-shows may result in a booking restriction until any outstanding amount is resolved.",
    },
    {
      icon: ICONS.reschedule,
      title: "Rescheduling",
      text: "Need a different time? Contact us via WhatsApp as early as possible. Rescheduling with more than 24 hours notice carries no fee; within 24 hours it is treated as a late cancellation.",
    },
    {
      icon: ICONS.clock,
      title: "Late Arrivals",
      text: "Please arrive on time for your appointment. Arriving significantly late may shorten your service time or require rescheduling, subject to availability.",
    },
    {
      icon: ICONS.soak,
      title: "Soak-Off & Foreign Product Removal",
      text: "Removal of an existing Nailed It Jess set or product applied elsewhere is charged separately. Foreign product removal may take longer and is priced accordingly — see the price list for details.",
    },
    {
      icon: ICONS.brush,
      title: "Nail Art Pricing",
      text: "Nail art such as French tips, freehand designs, and 3D art is priced per nail or as a full set. Where a price range is shown, the final amount depends on the complexity of your chosen design.",
    },
    {
      icon: ICONS.card,
      title: "Payment Methods",
      text: "Deposits and outstanding balances are currently processed by EFT, recorded manually by Nailed It Jess. Card payment options may be added in future.",
    },
  ];

  if (settings.nailRepairsPolicyPublished && settings.nailRepairsPolicyText) {
    cards.push({ icon: ICONS.repair, title: "Nail Repairs", text: settings.nailRepairsPolicyText });
  }
  if (settings.guestsChildrenPolicyPublished && settings.guestsChildrenPolicyText) {
    cards.push({ icon: ICONS.guests, title: "Guests & Children", text: settings.guestsChildrenPolicyText });
  }
  if (settings.healthAllergyPolicyPublished && settings.healthAllergyPolicyText) {
    cards.push({ icon: ICONS.health, title: "Health & Allergy Disclosure", text: settings.healthAllergyPolicyText });
  }

  return (
    <>
      <section className="bg-marble border-b border-marble py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-8 text-center flex flex-col items-center gap-4">
          <span className="text-xs tracking-[0.3em] uppercase text-medium-grey">Please Read</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-black">Booking Policies</h1>
          <p className="text-medium-grey max-w-2xl">
            To keep things fair for every client, please review our deposit, cancellation, no-show, and appointment policies before booking.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <FrostedCard key={card.title} className="p-6 flex flex-col gap-3">
              <div className="w-11 h-11 rounded-full bg-marble flex items-center justify-center">
                <Icon path={card.icon} />
              </div>
              <h3 className="font-display text-lg font-semibold text-black">{card.title}</h3>
              <p className="text-sm text-charcoal leading-relaxed">{card.text}</p>
            </FrostedCard>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-black mb-4 text-center">Prepare for Your Appointment</h2>
          <div className="bg-white border border-marble rounded-lg p-6 md:p-8 text-sm text-charcoal leading-relaxed whitespace-pre-line">
            {settings.prepareForAppointmentText}
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-black mb-4 text-center">Full Cancellation Policy</h2>
          <div className="bg-white border border-marble rounded-lg p-6 md:p-8 text-sm text-charcoal leading-relaxed whitespace-pre-line">
            {settings.cancellationPolicyText}
          </div>
          <p className="text-xs text-medium-grey text-center mt-4">Policy version {settings.policyVersion}</p>
        </div>

        <div className="flex justify-center mt-14">
          <LinkButton href="/book" size="lg">
            I Understand — Book Now
          </LinkButton>
        </div>
      </section>
    </>
  );
}
