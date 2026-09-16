"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

export function ProposalResponseButtons({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAccept, setPendingAccept] = useState<boolean | null>(null);

  async function respond(accept: boolean) {
    setBusy(true);
    setError(null);
    try {
      await postJson(`/api/manage/${token}/respond-proposal`, { accept });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
      setPendingAccept(null);
    }
  }

  if (pendingAccept !== null) {
    return (
      <div>
        <p className="text-sm text-charcoal mb-3">{pendingAccept ? "Accept this proposed appointment time?" : "Decline this proposed time?"}</p>
        <div className="flex gap-2">
          <Button disabled={busy} onClick={() => respond(pendingAccept)}>
            Confirm
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => setPendingAccept(null)}>
            Cancel
          </Button>
        </div>
        {error && <p className="text-error text-sm mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button disabled={busy} onClick={() => setPendingAccept(true)}>
          Accept New Time
        </Button>
        <Button variant="secondary" disabled={busy} onClick={() => setPendingAccept(false)}>
          Decline New Time
        </Button>
      </div>
      {error && <p className="text-error text-sm mt-3">{error}</p>}
    </div>
  );
}

export function CancelBookingButton({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function confirmCancel() {
    setBusy(true);
    setError(null);
    try {
      await postJson(`/api/manage/${token}/cancel`, { reason });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        Request Cancellation
      </Button>
    );
  }

  return (
    <div className="max-w-md">
      <p className="text-sm text-charcoal mb-2">
        Cancel this appointment? Depending on timing, this may forfeit your deposit or incur a cancellation fee per our policies.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Optional reason"
        rows={2}
        className="w-full border border-marble rounded-sm px-3 py-2 text-sm mb-2"
      />
      <div className="flex gap-2">
        <Button variant="danger" size="sm" disabled={busy} onClick={confirmCancel}>
          Confirm Cancellation
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Back
        </Button>
      </div>
      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}
