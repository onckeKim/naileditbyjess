import { BookingsManager } from "@/components/admin/BookingsManager";

export const dynamic = "force-dynamic";

export default function AdminBookingsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-black mb-1">Bookings</h1>
      <p className="text-sm text-medium-grey mb-8">Review, accept, and manage appointment requests.</p>
      <BookingsManager />
    </div>
  );
}
