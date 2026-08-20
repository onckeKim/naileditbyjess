import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Previous Work — Nailed It Jess" };
export const dynamic = "force-dynamic";

const ICONS = ["sparkle", "drop", "hand", "foot"] as const;

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });

  return (
    <>
      <section className="bg-marble border-b border-marble py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-8 text-center flex flex-col items-center gap-4">
          <span className="text-xs tracking-[0.3em] uppercase text-medium-grey">Portfolio</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-black">Previous Work</h1>
          <p className="text-medium-grey max-w-xl">A collection of recent sets from the studio, from classic overlays to freehand art.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8 py-16">
        {images.length === 0 ? (
          <p className="text-center text-medium-grey">Gallery photos coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {images.map((img, i) => (
              <div key={img.id} className="aspect-square relative overflow-hidden rounded-lg border border-marble group">
                {img.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.imageUrl} alt={img.caption} className="w-full h-full object-cover" />
                ) : (
                  <PlaceholderArt icon={ICONS[i % ICONS.length]} className="w-full h-full" label={img.caption} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-14">
          <LinkButton href="/book" size="lg">
            Book Your Appointment
          </LinkButton>
        </div>
      </section>
    </>
  );
}
