import { getSettings } from "@/lib/settings";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <Nav logoUrl={settings.logoUrl} established={settings.established} />
      <main className="flex-1">{children}</main>
      <Footer
        logoUrl={settings.logoUrl}
        established={settings.established}
        whatsapp={settings.whatsapp}
        instagram={settings.instagram}
      />
    </>
  );
}
