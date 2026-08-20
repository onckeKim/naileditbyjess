import { Card } from "@/components/ui/Card";
import { HoursTable } from "@/components/site/HoursTable";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { BusinessHours } from "@/lib/settings";

export function HoursAndContact({
  hours,
  whatsapp,
  instagram,
  address,
}: {
  hours: BusinessHours;
  whatsapp: string;
  instagram: string;
  address: string;
}) {
  const igHandle = instagram.replace(/^@/, "");
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="p-8">
        <span className="text-xs tracking-[0.3em] uppercase text-medium-grey">Studio Hours</span>
        <h2 className="font-display text-2xl font-semibold text-black mt-2 mb-4">Business Hours</h2>
        <HoursTable hours={hours} />
      </Card>

      <Card className="p-8 flex flex-col">
        <span className="text-xs tracking-[0.3em] uppercase text-medium-grey">Get in Touch</span>
        <h2 className="font-display text-2xl font-semibold text-black mt-2 mb-4">Contact Nailed It Jess</h2>
        {address && <p className="text-sm text-charcoal mb-2">{address}</p>}
        <p className="text-sm text-charcoal mb-2">WhatsApp: {whatsapp}</p>
        <p className="text-sm text-charcoal mb-6">
          Instagram:{" "}
          <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer" className="underline">
            @{igHandle}
          </a>
        </p>
        <div className="mt-auto">
          <WhatsAppButton whatsapp={whatsapp} />
        </div>
      </Card>
    </section>
  );
}
