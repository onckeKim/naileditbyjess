import { SectionHeading } from "@/components/ui/Card";

const STEPS = [
  { number: "01", title: "Choose Your Service", text: "Browse the price list and select the service and any nail art add-ons you'd like." },
  { number: "02", title: "Request a Date & Time", text: "Pick your preferred appointment slot and share your contact details and design notes." },
  { number: "03", title: "Secure with a 50% Deposit", text: "Once accepted, pay your 50% deposit by EFT to secure the appointment." },
  { number: "04", title: "Get Confirmed", text: "Receive a confirmation email with your appointment details and policies." },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-20 border-y border-marble">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading eyebrow="The Process" title="How Booking Works" subtitle="A simple four-step process from request to confirmed appointment." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col gap-3">
              <span className="font-display text-4xl text-silver">{step.number}</span>
              <h3 className="font-display text-lg font-semibold text-black">{step.title}</h3>
              <p className="text-sm text-medium-grey leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
