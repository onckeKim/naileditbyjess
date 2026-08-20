import type { Metadata } from "next";
import { getSettings, parseBusinessHours } from "@/lib/settings";
import { Card } from "@/components/ui/Card";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { HoursTable } from "@/components/site/HoursTable";

export const metadata: Metadata = { title: "Contact — Nailed It Jess" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();
  const igHandle = settings.instagram.replace(/^@/, "");

  return (
    <>
      <section className="bg-marble border-b border-marble py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-8 text-center flex flex-col items-center gap-4">
          <span className="text-xs tracking-[0.3em] uppercase text-medium-grey">Get in Touch</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-black">Contact Nailed It Jess</h1>
          <p className="text-medium-grey max-w-xl">
            The quickest way to reach us is via WhatsApp. For appointments, please use the online booking form.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-xs tracking-[0.3em] uppercase text-medium-grey mb-2">WhatsApp</h2>
            <p className="text-charcoal text-lg">{settings.whatsapp}</p>
          </div>
          <div>
            <h2 className="text-xs tracking-[0.3em] uppercase text-medium-grey mb-2">Instagram</h2>
            <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer" className="text-charcoal text-lg underline">
              @{igHandle}
            </a>
          </div>
          {settings.contactEmail && (
            <div>
              <h2 className="text-xs tracking-[0.3em] uppercase text-medium-grey mb-2">Email</h2>
              <a href={`mailto:${settings.contactEmail}`} className="text-charcoal text-lg underline">
                {settings.contactEmail}
              </a>
            </div>
          )}
          {settings.address && (
            <div>
              <h2 className="text-xs tracking-[0.3em] uppercase text-medium-grey mb-2">Location</h2>
              <p className="text-charcoal text-lg">{settings.address}</p>
            </div>
          )}
          <div className="mt-auto pt-2">
            <WhatsAppButton whatsapp={settings.whatsapp} />
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-xs tracking-[0.3em] uppercase text-medium-grey mb-4">Business Hours</h2>
          <HoursTable hours={parseBusinessHours(settings.businessHours)} />
        </Card>
      </section>
    </>
  );
}
