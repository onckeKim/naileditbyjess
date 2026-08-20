"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type BlockedDate = { id: string; date: string; reason: string };

export function BlockedDatesManager() {
  const [dates, setDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/blocked-dates");
    const data = await res.json();
    setDates(data.dates || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!newDate) return;
    setError(null);
    const res = await fetch("/api/admin/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: newDate, reason: newReason }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not add date.");
      return;
    }
    setNewDate("");
    setNewReason("");
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/blocked-dates/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="border border-marble rounded-sm px-3 py-2 text-sm" />
        <input
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          placeholder="Reason (e.g. Public holiday)"
          className="flex-1 border border-marble rounded-sm px-3 py-2 text-sm"
        />
        <Button size="sm" onClick={add} disabled={!newDate}>
          Block Date
        </Button>
      </div>
      {error && <p className="text-error text-xs mb-2">{error}</p>}
      {loading ? (
        <p className="text-xs text-medium-grey">Loading…</p>
      ) : dates.length === 0 ? (
        <p className="text-xs text-medium-grey">No blocked dates yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {dates.map((d) => (
            <li key={d.id} className="flex items-center justify-between text-sm bg-bg border border-marble rounded-sm px-3 py-2">
              <span>
                {d.date}
                {d.reason ? ` — ${d.reason}` : ""}
              </span>
              <button onClick={() => remove(d.id)} className="text-xs underline text-medium-grey">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
