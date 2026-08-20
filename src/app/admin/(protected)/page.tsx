import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { formatRand } from "@/lib/pricing";
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/lib/types";
import { bookingStatusTone } from "@/lib/status-tone";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [pending, awaitingDeposit, upcoming, restrictedClients, recentBookings] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "ACCEPTED_AWAITING_DEPOSIT" } }),
    prisma.booking.count({ where: { status: "CONFIRMED", requestedDate: { gte: new Date().toISOString().slice(0, 10) } } }),
    prisma.client.count({ where: { restricted: true } }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { service: true },
    }),
  ]);

  const stats = [
    { label: "Pending Requests", value: pending, href: "/admin/bookings?status=PENDING" },
    { label: "Awaiting Deposit", value: awaitingDeposit, href: "/admin/bookings?status=ACCEPTED_AWAITING_DEPOSIT" },
    { label: "Upcoming Confirmed", value: upcoming, href: "/admin/bookings?status=CONFIRMED" },
    { label: "Restricted Clients", value: restrictedClients, href: "/admin/clients" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-black mb-1">Dashboard</h1>
      <p className="text-sm text-medium-grey mb-8">An overview of booking activity at Nailed It Jess.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 hover:border-black transition-colors">
              <p className="text-3xl font-display text-black">{s.value}</p>
              <p className="text-xs text-medium-grey mt-1">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-black">Recent Booking Requests</h2>
          <Link href="/admin/bookings" className="text-xs underline text-medium-grey">
            View all
          </Link>
        </div>
        <div className="divide-y divide-marble">
          {recentBookings.length === 0 && <p className="text-sm text-medium-grey py-4">No bookings yet.</p>}
          {recentBookings.map((b) => (
            <Link
              key={b.id}
              href={`/admin/bookings?ref=${b.reference}`}
              className="flex items-center justify-between gap-4 py-3 hover:bg-bg -mx-2 px-2 rounded"
            >
              <div>
                <p className="text-sm text-black font-medium">
                  {b.clientName} · {b.service.name}
                </p>
                <p className="text-xs text-medium-grey">
                  {b.requestedDate} at {b.requestedTime} · {b.reference}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-black hidden sm:inline">{formatRand(b.estimatedTotal)}</span>
                <Badge tone={bookingStatusTone(b.status as BookingStatus)}>{BOOKING_STATUS_LABELS[b.status as BookingStatus]}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
