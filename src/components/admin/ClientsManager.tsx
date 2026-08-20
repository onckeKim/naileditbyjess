"use client";

import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  restricted: boolean;
  restrictionReason: string | null;
  _count: { bookings: number };
};

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reasonDraft, setReasonDraft] = useState<Record<string, string>>({});

  async function load(query = "") {
    setLoading(true);
    const res = await fetch(`/api/admin/clients${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    const data = await res.json();
    setClients(data.clients || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setRestricted(client: Client, restricted: boolean) {
    const message = restricted
      ? `Restrict ${client.name} from booking online?`
      : `Remove the booking restriction for ${client.name}?`;
    if (!window.confirm(message)) return;
    await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restricted, restrictionReason: restricted ? reasonDraft[client.id] || "Outstanding cancellation fee" : null }),
    });
    load(q);
  }

  return (
    <div>
      <div className="flex gap-2 mb-6 max-w-md">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(q)}
          placeholder="Search name, email, phone…"
          className="flex-1 border border-marble rounded-sm px-3 py-2 text-sm"
        />
        <Button size="sm" variant="secondary" onClick={() => load(q)}>
          Search
        </Button>
        <a href={`/api/admin/clients?format=csv${q ? `&q=${encodeURIComponent(q)}` : ""}`} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="secondary">
            Export CSV
          </Button>
        </a>
      </div>

      {loading ? (
        <p className="text-sm text-medium-grey">Loading…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {clients.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-black">{c.name}</p>
                  <p className="text-xs text-medium-grey">
                    {c.email} · {c.phone}
                  </p>
                  <p className="text-xs text-medium-grey mt-1">{c._count.bookings} booking{c._count.bookings === 1 ? "" : "s"}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {c.restricted ? (
                    <>
                      <Badge tone="error">Restricted</Badge>
                      <p className="text-xs text-medium-grey max-w-xs text-right">{c.restrictionReason}</p>
                      <Button size="sm" variant="ghost" onClick={() => setRestricted(c, false)}>
                        Remove Restriction
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        placeholder="Restriction reason"
                        value={reasonDraft[c.id] || ""}
                        onChange={(e) => setReasonDraft((d) => ({ ...d, [c.id]: e.target.value }))}
                        className="border border-marble rounded-sm px-2 py-1.5 text-xs w-40"
                      />
                      <Button size="sm" variant="danger" onClick={() => setRestricted(c, true)}>
                        Restrict
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {clients.length === 0 && <p className="text-sm text-medium-grey">No clients found.</p>}
        </div>
      )}
    </div>
  );
}
