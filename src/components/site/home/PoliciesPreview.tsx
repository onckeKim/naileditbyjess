import { FrostedCard } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

const HIGHLIGHTS = [
  { title: "50% Deposit", text: "A 50% deposit is required to secure every appointment." },
  { title: "24-Hour Cancellations", text: "Please cancel at least 24 hours in advance to avoid a fee." },
  { title: "No-Shows", text: "Missed appointments are treated as cancellations and forfeit the deposit." },
];

export function PoliciesPreview({ depositPercentage }: { depositPercentage: number }) {
  return (
    <section className="bg-marble-dark py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col items-center text-center gap-3 mb-10">
          <span className="text-xs tracking-[0.3em] uppercase text-silver">Good to Know</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white">Booking Policies</h2>
          <p className="max-w-2xl text-sm md:text-base text-silver">
            A quick overview of how deposits, cancellations, and appointments work at Nailed It Jess.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HIGHLIGHTS.map((h) => (
            <FrostedCard key={h.title} className="p-6">
              <h3 className="font-display text-lg font-semibold text-black mb-2">
                {h.title === "50% Deposit" ? `${depositPercentage}% Deposit` : h.title}
              </h3>
              <p className="text-sm text-charcoal/80">{h.text}</p>
            </FrostedCard>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <LinkButton href="/policies" variant="secondary" className="!bg-transparent !text-white !border-white/50 hover:!bg-white/10">
            Read Full Policies
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
