"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { LinkButton } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Previous Work" },
  { href: "/policies", label: "Policies" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export function Nav({ logoUrl, established }: { logoUrl?: string | null; established: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-marble">
      <div className="mx-auto max-w-7xl px-4 md:px-8 flex items-center justify-between h-20">
        <Logo logoUrl={logoUrl} established={established} size="sm" />

        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide transition-colors hover:text-black ${
                pathname === link.href ? "text-black font-medium" : "text-medium-grey"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <LinkButton href="/book" size="sm">
            Book Now
          </LinkButton>
        </div>

        <button
          className="lg:hidden inline-flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`block h-px w-6 bg-black transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-px w-6 bg-black transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-6 bg-black transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-marble bg-white px-4 pb-6 pt-2">
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`py-3 text-base border-b border-marble/70 ${
                  pathname === link.href ? "text-black font-medium" : "text-charcoal"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-sm bg-black px-6 py-3 text-sm font-medium tracking-wide text-white border border-black hover:bg-charcoal"
          >
            Book Now
          </Link>
        </div>
      )}
    </header>
  );
}
