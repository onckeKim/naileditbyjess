import { prisma } from "@/lib/prisma";
import { getSettings, parseBusinessHours } from "@/lib/settings";
import { Hero } from "@/components/site/home/Hero";
import { AboutPreview } from "@/components/site/home/AboutPreview";
import { HowItWorks } from "@/components/site/home/HowItWorks";
import { GalleryPreview } from "@/components/site/home/GalleryPreview";
import { PoliciesPreview } from "@/components/site/home/PoliciesPreview";
import { ReviewsPreview } from "@/components/site/home/ReviewsPreview";
import { HoursAndContact } from "@/components/site/home/HoursAndContact";
import { ServiceCard } from "@/components/site/ServiceCard";
import { SectionHeading } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export default async function HomePage() {
  const [settings, featuredServices, galleryImages, reviews] = await Promise.all([
    getSettings(),
    prisma.service.findMany({ where: { category: "PRIMARY", active: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
    prisma.galleryImage.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    prisma.review.findMany({ where: { approved: true, featured: true }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  return (
    <>
      <Hero
        logoUrl={settings.logoUrl}
        established={settings.established}
        heading={settings.heroHeading}
        subtext={settings.heroSubtext}
        heroImageUrl={settings.heroImageUrl}
      />

      <AboutPreview bio={settings.aboutBio} yearsExperience={settings.aboutYearsExperience} />

      <section className="bg-bg py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeading eyebrow="Price List" title="Featured Services" subtitle="A selection of our most-loved services. See the full price list for everything on offer." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} defaultDepositPercentage={settings.depositPercentage} />
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <LinkButton href="/services" variant="secondary">
              View Full Price List
            </LinkButton>
          </div>
        </div>
      </section>

      <HowItWorks />
      <GalleryPreview images={galleryImages} />
      <PoliciesPreview depositPercentage={settings.depositPercentage} />
      <ReviewsPreview reviews={reviews} />
      <HoursAndContact
        hours={parseBusinessHours(settings.businessHours)}
        whatsapp={settings.whatsapp}
        instagram={settings.instagram}
        address={settings.address}
      />
    </>
  );
}
