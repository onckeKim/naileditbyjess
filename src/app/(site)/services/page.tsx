import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ServiceCard } from "@/components/site/ServiceCard";
import { describeServicePrice } from "@/lib/pricing";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Services & Price List — Nailed It Jess" };
export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, { title: string; subtitle: string }> = {
  PRIMARY: { title: "Primary Services", subtitle: "Manicures, gel overlays, extensions, and pedicures." },
  ART_ADDON: { title: "Nail Art & Add-Ons", subtitle: "Enhance any set with French tips, freehand art, chrome, and more." },
  REMOVAL: { title: "Removal Services", subtitle: "Safe soak-off removal for existing product." },
};

export default async function ServicesPage() {
  const [settings, services] = await Promise.all([
    getSettings(),
    prisma.service.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
  ]);

  const primary = services.filter((s) => s.category === "PRIMARY");
  const addOns = services.filter((s) => s.category === "ART_ADDON");
  const removal = services.filter((s) => s.category === "REMOVAL");

  return (
    <>
      <section className="bg-marble border-b border-marble py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-8 text-center flex flex-col items-center gap-4">
          <span className="text-xs tracking-[0.3em] uppercase text-medium-grey">Price List</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-black">Services</h1>
          <p className="text-medium-grey max-w-xl">
            A {settings.depositPercentage}% deposit is required to secure every appointment. Estimated prices may vary depending on your selected design.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8 py-16">
        <div className="mb-3">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-black">{CATEGORY_LABELS.PRIMARY.title}</h2>
          <p className="text-sm text-medium-grey mt-1">{CATEGORY_LABELS.PRIMARY.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {primary.map((service) => (
            <ServiceCard key={service.id} service={service} defaultDepositPercentage={settings.depositPercentage} />
          ))}
        </div>

        <div className="mb-3">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-black">{CATEGORY_LABELS.ART_ADDON.title}</h2>
          <p className="text-sm text-medium-grey mt-1">{CATEGORY_LABELS.ART_ADDON.subtitle}</p>
        </div>
        <Card className="mb-20 divide-y divide-marble overflow-hidden">
          {addOns.map((service) => {
            const { label, isEstimate } = describeServicePrice(service);
            return (
              <div key={service.id} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <h3 className="font-display text-lg text-black">{service.name}</h3>
                  {service.description && <p className="text-sm text-medium-grey mt-0.5">{service.description}</p>}
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="font-display text-black">{label}</p>
                  {isEstimate && <p className="text-[11px] text-medium-grey">Estimate — final price varies</p>}
                </div>
              </div>
            );
          })}
        </Card>

        <div className="mb-3">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-black">{CATEGORY_LABELS.REMOVAL.title}</h2>
          <p className="text-sm text-medium-grey mt-1">{CATEGORY_LABELS.REMOVAL.subtitle}</p>
        </div>
        <Card className="divide-y divide-marble overflow-hidden">
          {removal.map((service) => {
            const { label } = describeServicePrice(service);
            return (
              <div key={service.id} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <h3 className="font-display text-lg text-black">{service.name}</h3>
                  {service.description && <p className="text-sm text-medium-grey mt-0.5">{service.description}</p>}
                </div>
                <p className="font-display text-black whitespace-nowrap">{label}</p>
              </div>
            );
          })}
        </Card>
      </section>
    </>
  );
}
