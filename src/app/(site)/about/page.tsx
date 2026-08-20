import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "About — Nailed It Jess" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <section className="bg-marble border-b border-marble py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-8 text-center flex flex-col items-center gap-4">
          <span className="text-xs tracking-[0.3em] uppercase text-medium-grey">About</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-black text-balance">
            Meet <span className="font-signature text-5xl md:text-6xl">Jess</span>
          </h1>
          <p className="text-medium-grey max-w-xl">Nailed It Jess, established {settings.established}.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2">
          <PlaceholderArt icon="sparkle" className="aspect-[4/5] w-full rounded-lg border border-marble sticky top-24" label="Nailed It Jess" />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-10">
          <div>
            <h2 className="text-xs tracking-[0.3em] uppercase text-medium-grey mb-3">Biography</h2>
            <p className="text-charcoal text-base leading-relaxed whitespace-pre-line">{settings.aboutBio}</p>
          </div>

          <div>
            <h2 className="text-xs tracking-[0.3em] uppercase text-medium-grey mb-3">Qualifications</h2>
            <p className="text-charcoal text-base leading-relaxed whitespace-pre-line">{settings.aboutQualifications}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xs tracking-[0.3em] uppercase text-medium-grey mb-3">Experience</h2>
              <p className="text-charcoal text-base">{settings.aboutYearsExperience}</p>
            </div>
            <div>
              <h2 className="text-xs tracking-[0.3em] uppercase text-medium-grey mb-3">Location</h2>
              <p className="text-charcoal text-base">{settings.aboutLocation}</p>
            </div>
          </div>

          <div className="pt-4">
            <LinkButton href="/book" size="lg">
              Book Your Appointment
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
