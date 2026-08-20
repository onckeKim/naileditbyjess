"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge, Card } from "@/components/ui/Card";
import { formatRand } from "@/lib/pricing";
import { BOOKING_STATUS_LABELS, DEPOSIT_STATUS_LABELS, type BookingStatus, type DepositStatus } from "@/lib/types";
import { bookingStatusTone, depositStatusTone } from "@/lib/status-tone";
import { BookingDetailPanel } from "./BookingDetailPanel";
import type { AdminBooking } from "./types";

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "ACCEPTED_AWAITING_DEPOSIT",
  "DEPOSIT_SUBMITTED",
  "CONFIRMED",
  "PROPOSED_NEW_TIME",
  "DECLINED",
  "CANCELLED",
  "NO_SHOW",
  "COMPLETED",
];

function ManagerInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [q, setQ] = useState("");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/bookings?${params.toString()}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }, [status, q]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && bookings.length) {
      const found = bookings.find((b) => b.reference === ref);
      if (found) setSelectedId(found.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const selected = bookings.find((b) => b.id === selectedId) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-marble rounded-sm px-3 py-2 text-sm"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All Statuses" : BOOKING_STATUS_LABELS[s as BookingStatus]}
              </option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, reference…"
            className="flex-1 border border-marble rounded-sm px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-1">
          {loading && <p className="text-sm text-medium-grey">Loading…</p>}
          {!loading && bookings.length === 0 && <p className="text-sm text-medium-grey">No bookings match.</p>}
          {bookings.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              className={`text-left rounded-lg border p-4 transition-colors ${
                b.id === selectedId ? "border-black bg-white" : "border-marble bg-white/70 hover:border-medium-grey"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-black">{b.clientName}</p>
                  <p className="text-xs text-medium-grey">{b.service.name}</p>
                </div>
                <span className="text-xs text-medium-grey whitespace-nowrap">{formatRand(b.estimatedTotal)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-medium-grey">
                  {b.proposedDate ?? b.requestedDate} {b.proposedTime ?? b.requestedTime}
                </span>
                <Badge tone={bookingStatusTone(b.status as BookingStatus)}>{BOOKING_STATUS_LABELS[b.status as BookingStatus]}</Badge>
              </div>
              {b.depositStatus !== "NOT_REQUIRED" && (
                <div className="mt-1.5">
                  <Badge tone={depositStatusTone(b.depositStatus as DepositStatus)}>{DEPOSIT_STATUS_LABELS[b.depositStatus as DepositStatus]}</Badge>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <BookingDetailPanel booking={selected} onUpdated={load} />
        ) : (
          <Card className="p-10 text-center text-sm text-medium-grey">Select a booking to view details.</Card>
        )}
      </div>
    </div>
  );
}

export function BookingsManager() {
  return (
    <Suspense fallback={<p className="text-sm text-medium-grey">Loading…</p>}>
      <ManagerInner />
    </Suspense>
  );
}
