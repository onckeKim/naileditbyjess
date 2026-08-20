import { Card, SectionHeading } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { LinkButton } from "@/components/ui/Button";

export function ReviewsPreview({ reviews }: { reviews: { id: string; clientName: string; rating: number; text: string }[] }) {
  if (reviews.length === 0) return null;
  return (
    <section className="bg-white py-20 border-y border-marble">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading eyebrow="Client Love" title="What Clients Say" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <Card key={r.id} className="p-6 flex flex-col gap-3">
              <StarRating rating={r.rating} />
              <p className="text-sm text-charcoal leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              <p className="text-xs tracking-wide uppercase text-medium-grey mt-auto">{r.clientName}</p>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <LinkButton href="/reviews" variant="secondary">
            Read All Reviews
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
