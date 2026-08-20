"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Card";

type LogEntry = {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  bookingId: string;
  booking: { reference: string; clientName: string; requestedDate: string; requestedTime: string };
};

export function RemindersLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/reminders");
    const data = await res.json();
    setLogs(data.logs || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function resend(entry: LogEntry) {
    setBusyId(entry.id);
    try {
      await fetch("/api/admin/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: entry.bookingId, type: entry.type }),
      });
      load();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-xs text-medium-grey">Loading…</p>;
  if (logs.length === 0) return <p className="text-xs text-medium-grey">No reminders sent yet.</p>;

  return (
    <ul className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
      {logs.map((l) => (
        <li key={l.id} className="flex items-center justify-between text-xs bg-bg border border-marble rounded-sm px-3 py-2">
          <span>
            {l.booking.clientName} · {l.booking.reference} · {l.type === "24H" ? "24h" : "2h"} reminder ·{" "}
            {new Date(l.createdAt).toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <Badge tone={l.status === "SENT" ? "success" : "error"}>{l.status}</Badge>
            <button onClick={() => resend(l)} disabled={busyId === l.id} className="underline text-medium-grey">
              Resend
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
