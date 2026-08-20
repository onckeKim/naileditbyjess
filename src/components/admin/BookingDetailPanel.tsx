"use client";

import { useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatRand } from "@/lib/pricing";
import {
  BOOKING_STATUS_LABELS,
  DEPOSIT_STATUS_LABELS,
  CANCELLATION_FEE_STATUS_LABELS,
  type BookingStatus,
  type DepositStatus,
  type CancellationFeeStatus,
} from "@/lib/types";
import { bookingStatusTone, depositStatusTone, cancellationFeeStatusTone } from "@/lib/status-tone";
import type { AdminBooking } from "./types";

const DEPOSIT_OPTIONS: DepositStatus[] = [
  "AWAITING_DEPOSIT",
  "DEPOSIT_SUBMITTED",
  "DEPOSIT_PAID",
  "DEPOSIT_FAILED",
  "DEPOSIT_REFUNDED",
  "DEPOSIT_FORFEITED",
];

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Action failed.");
  return data;
}

async function patchJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Action failed.");
  return data;
}

export function BookingDetailPanel({ booking, onUpdated }: { booking: AdminBooking; onUpdated: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<null | "propose" | "decline" | "deposit" | "cancel" | "no-show">(null);

  const [proposeDate, setProposeDate] = useState(booking.requestedDate);
  const [proposeTime, setProposeTime] = useState(booking.requestedTime);
  const [declineReason, setDeclineReason] = useState("");
  const [depositStatus, setDepositStatus] = useState<DepositStatus>((booking.depositStatus as DepositStatus) || "AWAITING_DEPOSIT");
  const [depositMethod, setDepositMethod] = useState(booking.depositMethod || "EFT");
  const [cancelReason, setCancelReason] = useState("");
  const [restrictClient, setRestrictClient] = useState(false);
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      setActiveAction(null);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function saveNotes() {
    await run(() => patchJson(`/api/admin/bookings/${booking.id}`, { adminNotes }));
  }

  async function markFeePaid() {
    await run(() => patchJson(`/api/admin/bookings/${booking.id}`, { cancellationFeeStatus: "FEE_PAID" }));
  }

  const status = booking.status as BookingStatus;

  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <p className="text-xs tracking-widest uppercase text-medium-grey">{booking.reference}</p>
          <h2 className="font-display text-2xl font-semibold text-black">{booking.clientName}</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge tone={bookingStatusTone(status)}>{BOOKING_STATUS_LABELS[status]}</Badge>
          {booking.depositStatus !== "NOT_REQUIRED" && (
            <Badge tone={depositStatusTone(booking.depositStatus as DepositStatus)}>
              {DEPOSIT_STATUS_LABELS[booking.depositStatus as DepositStatus]}
            </Badge>
          )}
        </div>
      </div>

      {booking.client.restricted && (
        <div className="mb-6 bg-error/10 border border-error/30 rounded-sm px-4 py-3 text-sm text-error">
          This client has a booking restriction: {booking.client.restrictionReason || "No reason recorded."}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-xs tracking-[0.25em] uppercase text-medium-grey mb-2">Contact</h3>
          <p className="text-sm text-charcoal">{booking.clientEmail}</p>
          <p className="text-sm text-charcoal">{booking.clientPhone}</p>
        </div>
        <div>
          <h3 className="text-xs tracking-[0.25em] uppercase text-medium-grey mb-2">Schedule</h3>
          <p className="text-sm text-charcoal">
            Requested: {booking.requestedDate} at {booking.requestedTime}
          </p>
          {booking.proposedDate && (
            <p className="text-sm text-charcoal">
              Proposed: {booking.proposedDate} at {booking.proposedTime}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs tracking-[0.25em] uppercase text-medium-grey mb-2">Service &amp; Pricing</h3>
        <div className="bg-bg border border-marble rounded-lg p-4 text-sm">
          <div className="flex justify-between py-1">
            <span>{booking.service.name}</span>
            <span>{formatRand(booking.serviceSubtotal)}</span>
          </div>
          {booking.addOns.map((a) => (
            <div key={a.id} className="flex justify-between py-1 text-medium-grey">
              <span>
                {a.service.name}
                {a.nailCount ? ` (${a.nailCount} nails)` : ""}
              </span>
              <span>{formatRand(a.calculatedPrice)}</span>
            </div>
          ))}
          <div className="border-t border-marble mt-2 pt-2 flex justify-between font-medium">
            <span>Estimated Total</span>
            <span>{formatRand(booking.estimatedTotal)}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span>Deposit</span>
            <span>{formatRand(booking.depositAmount)}</span>
          </div>
          <div className="flex justify-between pt-1 text-medium-grey">
            <span>Remaining Balance</span>
            <span>{formatRand(booking.remainingBalance)}</span>
          </div>
        </div>
      </div>

      {(booking.designNotes || booking.inspirationImageUrl) && (
        <div className="mb-6">
          <h3 className="text-xs tracking-[0.25em] uppercase text-medium-grey mb-2">Design Notes</h3>
          {booking.designNotes && <p className="text-sm text-charcoal whitespace-pre-line mb-3">{booking.designNotes}</p>}
          {booking.inspirationImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={booking.inspirationImageUrl} alt="Inspiration" className="max-w-xs rounded-lg border border-marble" />
          )}
        </div>
      )}

      {booking.policyAcceptance && (
        <div className="mb-6">
          <h3 className="text-xs tracking-[0.25em] uppercase text-medium-grey mb-2">Policy Acceptance</h3>
          <p className="text-xs text-medium-grey">
            Version {booking.policyAcceptance.policyVersion} accepted {new Date(booking.policyAcceptance.acceptedAt).toLocaleString()}
          </p>
        </div>
      )}

      {booking.cancellationFeeStatus !== "NONE" && (
        <div className="mb-6">
          <h3 className="text-xs tracking-[0.25em] uppercase text-medium-grey mb-2">Cancellation Fee</h3>
          <div className="flex items-center gap-3">
            <Badge tone={cancellationFeeStatusTone(booking.cancellationFeeStatus as CancellationFeeStatus)}>
              {CANCELLATION_FEE_STATUS_LABELS[booking.cancellationFeeStatus as CancellationFeeStatus]}
            </Badge>
            {booking.cancellationFeeAmount != null && <span className="text-sm text-charcoal">{formatRand(booking.cancellationFeeAmount)}</span>}
            {booking.cancellationFeeStatus === "ADDITIONAL_FEE_DUE" && (
              <button onClick={markFeePaid} disabled={busy} className="text-xs underline text-medium-grey">
                Mark as paid
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xs tracking-[0.25em] uppercase text-medium-grey mb-2">Admin Notes</h3>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={3}
          className="w-full border border-marble rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
        <button onClick={saveNotes} disabled={busy} className="text-xs underline text-medium-grey mt-1">
          Save notes
        </button>
      </div>

      {error && <p className="text-error text-sm mb-4 bg-error/10 border border-error/30 rounded-sm px-3 py-2">{error}</p>}

      <div className="flex flex-wrap gap-3 pt-4 border-t border-marble">
        {status === "PENDING" && (
          <>
            <Button size="sm" disabled={busy} onClick={() => run(() => postJson(`/api/admin/bookings/${booking.id}/accept`))}>
              Accept
            </Button>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setActiveAction("propose")}>
              Propose New Time
            </Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => setActiveAction("decline")}>
              Decline
            </Button>
          </>
        )}

        {status === "PROPOSED_NEW_TIME" && (
          <>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setActiveAction("propose")}>
              Propose Different Time
            </Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => setActiveAction("decline")}>
              Decline
            </Button>
          </>
        )}

        {(status === "ACCEPTED_AWAITING_DEPOSIT" || status === "DEPOSIT_SUBMITTED") && (
          <>
            <Button size="sm" disabled={busy} onClick={() => setActiveAction("deposit")}>
              Record Deposit
            </Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => setActiveAction("cancel")}>
              Cancel Booking
            </Button>
          </>
        )}

        {status === "CONFIRMED" && (
          <>
            <Button size="sm" disabled={busy} onClick={() => run(() => postJson(`/api/admin/bookings/${booking.id}/complete`))}>
              Mark Completed
            </Button>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setActiveAction("deposit")}>
              Update Deposit
            </Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => setActiveAction("cancel")}>
              Cancel Booking
            </Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => setActiveAction("no-show")}>
              Mark No-Show
            </Button>
          </>
        )}

        {(status === "DECLINED" || status === "CANCELLED" || status === "NO_SHOW" || status === "COMPLETED") && (
          <p className="text-xs text-medium-grey">This booking is finalised. Use admin notes to record any follow-up.</p>
        )}
      </div>

      {activeAction === "propose" && (
        <div className="mt-4 bg-bg border border-marble rounded-lg p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-medium-grey mb-1">Date</label>
              <input type="date" value={proposeDate} onChange={(e) => setProposeDate(e.target.value)} className="w-full border border-marble rounded-sm px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-medium-grey mb-1">Time</label>
              <input type="time" value={proposeTime} onChange={(e) => setProposeTime(e.target.value)} className="w-full border border-marble rounded-sm px-2 py-1.5 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={busy}
              onClick={() => run(() => postJson(`/api/admin/bookings/${booking.id}/propose`, { date: proposeDate, time: proposeTime }))}
            >
              Send Proposal
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setActiveAction(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {activeAction === "decline" && (
        <div className="mt-4 bg-bg border border-marble rounded-lg p-4 flex flex-col gap-3">
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Optional reason shared with the client"
            rows={2}
            className="w-full border border-marble rounded-sm px-2 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              disabled={busy}
              onClick={() => run(() => postJson(`/api/admin/bookings/${booking.id}/decline`, { reason: declineReason }))}
            >
              Confirm Decline
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setActiveAction(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {activeAction === "deposit" && (
        <div className="mt-4 bg-bg border border-marble rounded-lg p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-medium-grey mb-1">Status</label>
              <select
                value={depositStatus}
                onChange={(e) => setDepositStatus(e.target.value as DepositStatus)}
                className="w-full border border-marble rounded-sm px-2 py-1.5 text-sm"
              >
                {DEPOSIT_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {DEPOSIT_STATUS_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-medium-grey mb-1">Method</label>
              <input value={depositMethod} onChange={(e) => setDepositMethod(e.target.value)} className="w-full border border-marble rounded-sm px-2 py-1.5 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={busy}
              onClick={() => run(() => postJson(`/api/admin/bookings/${booking.id}/deposit`, { depositStatus, method: depositMethod }))}
            >
              Save Deposit Status
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setActiveAction(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {activeAction === "cancel" && (
        <div className="mt-4 bg-bg border border-marble rounded-lg p-4 flex flex-col gap-3">
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation"
            rows={2}
            className="w-full border border-marble rounded-sm px-2 py-1.5 text-sm"
          />
          <p className="text-xs text-medium-grey">
            Late-cancellation fee logic applies automatically based on the appointment time and your cancellation fee settings.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              disabled={busy}
              onClick={() => run(() => postJson(`/api/admin/bookings/${booking.id}/cancel`, { reason: cancelReason }))}
            >
              Confirm Cancellation
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setActiveAction(null)}>
              Back
            </Button>
          </div>
        </div>
      )}

      {activeAction === "no-show" && (
        <div className="mt-4 bg-bg border border-marble rounded-lg p-4 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={restrictClient} onChange={(e) => setRestrictClient(e.target.checked)} className="accent-black" />
            Restrict this client from booking online until resolved
          </label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              disabled={busy}
              onClick={() => run(() => postJson(`/api/admin/bookings/${booking.id}/no-show`, { restrictClient }))}
            >
              Confirm No-Show
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setActiveAction(null)}>
              Back
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
