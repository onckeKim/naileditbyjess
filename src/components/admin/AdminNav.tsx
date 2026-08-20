"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-full md:w-60 md:min-h-screen bg-marble-dark text-white flex md:flex-col shrink-0">
      <div className="p-6 hidden md:block">
        <p className="font-display text-xl">NAILED IT</p>
        <p className="font-signature text-2xl -mt-1">Jess</p>
        <p className="text-[10px] tracking-[0.25em] text-silver mt-1">ADMIN</p>
      </div>
      <nav className="flex md:flex-col overflow-x-auto md:overflow-visible flex-1 px-2 md:px-3 py-2 md:py-0 gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-4 py-2.5 rounded-sm text-sm transition-colors ${
                active ? "bg-white text-black" : "text-white/80 hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 hidden md:block">
        <p className="text-xs text-white/60 mb-2">Signed in as {adminName}</p>
        <button onClick={handleLogout} className="text-xs underline text-white/80 hover:text-white">
          Log out
        </button>
      </div>
    </aside>
  );
}
