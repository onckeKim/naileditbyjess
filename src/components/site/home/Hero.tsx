import { Logo } from "@/components/ui/Logo";
import { LinkButton } from "@/components/ui/Button";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";

export function Hero({
  logoUrl,
  established,
  heading,
  subtext,
  heroImageUrl,
}: {
  logoUrl?: string | null;
  established: string;
  heading: string;
  subtext: string;
  heroImageUrl?: string | null;
}) {
  return (
    <section className="bg-marble border-b border-marble relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
        <div className="fade-in-up flex flex-col gap-6 items-start">
          <div className="hidden md:block">
            <Logo logoUrl={logoUrl} established={established} size="lg" />
          </div>
          <div className="md:hidden">
            <Logo logoUrl={logoUrl} established={established} size="md" />
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-black text-balance leading-[1.1] mt-2">
            {heading}
          </h1>
          <p className="text-medium-grey text-base md:text-lg max-w-lg">{subtext}</p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto">
            <LinkButton href="/book" size="lg">
              Book Your Appointment
            </LinkButton>
            <LinkButton href="/gallery" variant="secondary" size="lg">
              View Previous Work
            </LinkButton>
          </div>

          <p className="text-xs tracking-[0.25em] uppercase text-medium-grey mt-4">Established {established}</p>
        </div>

        <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none">
          {heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImageUrl} alt="Nailed It Jess nail work" className="w-full h-full object-cover rounded-lg border border-silver" />
          ) : (
            <PlaceholderArt icon="hand" className="w-full h-full rounded-lg border border-silver" label="Nailed It Jess" />
          )}
          <div className="absolute -bottom-4 -left-4 hidden md:block bg-white border border-marble rounded-lg shadow-lg px-5 py-4">
            <p className="font-display text-2xl text-black">50%</p>
            <p className="text-[11px] tracking-widest uppercase text-medium-grey">Deposit secures your slot</p>
          </div>
        </div>
      </div>
    </section>
  );
}
