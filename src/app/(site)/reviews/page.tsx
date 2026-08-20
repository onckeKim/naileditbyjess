import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Reviews — Nailed It Jess" };
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    include: { service: { select: { name: true } } },
  });
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <>
      <section className="bg-marble border-b border-marble py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-8 text-center flex flex-col items-center gap-4">
          <span className="text-xs tracking-[0.3em] uppercase text-medium-grey">Client Love</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-black">Reviews</h1>
          {reviews.length > 0 && (
            <div className="flex flex-col items-center gap-1">
              <StarRating rating={Math.round(average)} />
              <p className="text-sm text-medium-grey">
                {average.toFixed(1)} average from {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-8 py-16">
        {reviews.length === 0 ? (
          <p className="text-center text-medium-grey">No reviews yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <Card key={r.id} className="p-6 flex flex-col gap-3">
                {r.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.imageUrl} alt="" className="w-full aspect-[4/3] object-cover rounded-lg border border-marble" />
                )}
                <StarRating rating={r.rating} />
                <p className="text-sm text-charcoal leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                <p className="text-xs tracking-wide uppercase text-medium-grey mt-auto">
                  {r.clientName}
                  {r.service ? ` · ${r.service.name}` : ""}
                </p>
              </Card>
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
