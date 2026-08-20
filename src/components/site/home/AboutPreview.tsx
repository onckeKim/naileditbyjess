import { LinkButton } from "@/components/ui/Button";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";

export function AboutPreview({ bio, yearsExperience }: { bio: string; yearsExperience: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <PlaceholderArt icon="sparkle" className="aspect-[4/3] w-full rounded-lg border border-marble order-2 lg:order-1" label="In the studio" />

      <div className="order-1 lg:order-2 flex flex-col gap-5 items-start">
        <span className="text-xs tracking-[0.3em] uppercase text-medium-grey">About the studio</span>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-black text-balance">
          Meet <span className="font-signature text-4xl md:text-5xl">Jess</span>
        </h2>
        <p className="text-charcoal text-base leading-relaxed">{bio}</p>
        <p className="text-sm text-medium-grey">{yearsExperience} of dedicated nail artistry experience.</p>
        <LinkButton href="/about" variant="secondary">
          Learn More About Us
        </LinkButton>
      </div>
    </section>
  );
}
