import { SectionHeading } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";

const ICONS = ["sparkle", "drop", "hand", "sparkle", "foot", "drop"] as const;

export function GalleryPreview({ images }: { images: { id: string; imageUrl: string; caption: string }[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 py-20">
      <SectionHeading eyebrow="Portfolio" title="Previous Work" subtitle="A glimpse of recent sets from the studio." />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {images.map((img, i) => (
          <div key={img.id} className="aspect-square relative overflow-hidden rounded-lg border border-marble">
            {img.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.imageUrl} alt={img.caption} className="w-full h-full object-cover" />
            ) : (
              <PlaceholderArt icon={ICONS[i % ICONS.length]} className="w-full h-full" label={img.caption} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-10">
        <LinkButton href="/gallery" variant="secondary">
          View Full Gallery
        </LinkButton>
      </div>
    </section>
  );
}
