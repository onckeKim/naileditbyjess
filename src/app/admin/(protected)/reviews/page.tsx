import { ReviewsManager } from "@/components/admin/ReviewsManager";

export const dynamic = "force-dynamic";

export default function AdminReviewsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-black mb-1">Reviews</h1>
      <p className="text-sm text-medium-grey mb-8">Approve and feature client reviews shown on the public site.</p>
      <ReviewsManager />
    </div>
  );
}
