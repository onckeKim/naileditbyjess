import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function Footer({
  logoUrl,
  established,
  whatsapp,
  instagram,
}: {
  logoUrl?: string | null;
  established: string;
  whatsapp: string;
  instagram: string;
}) {
  const igHandle = instagram.replace(/^@/, "");
  return (
    <footer className="bg-marble-dark text-white mt-24">
      <div className="marble-divider" />
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <Logo logoUrl={logoUrl} established={established} light />
          <p className="mt-4 text-sm text-silver max-w-xs">
            Professional nail services designed to match your style — established {established}.
          </p>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.25em] uppercase text-silver mb-4">Explore</h3>
          <ul className="space-y-2 text-sm">
            {[
              ["Home", "/"],
              ["About", "/about"],
              ["Services", "/services"],
              ["Previous Work", "/gallery"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-white/80 hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.25em] uppercase text-silver mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            {[
              ["Policies", "/policies"],
              ["Reviews", "/reviews"],
              ["Contact", "/contact"],
              ["Book Now", "/book"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-white/80 hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.25em] uppercase text-silver mb-4">Get in touch</h3>
          <p className="text-sm text-white/80 mb-1">
            Instagram:{" "}
            <a
              href={`https://instagram.com/${igHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline"
            >
              @{igHandle}
            </a>
          </p>
          <p className="text-sm text-white/80 mb-4">WhatsApp: {whatsapp}</p>
          <WhatsAppButton whatsapp={whatsapp} variant="outline" className="!bg-transparent !text-white !border-white/40 hover:!bg-white/10" />
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 md:px-8 py-6 text-xs text-white/50">
          © {new Date().getFullYear()} Nailed It Jess. Established {established}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
