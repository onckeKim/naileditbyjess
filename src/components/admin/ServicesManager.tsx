"use client";

import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { describeServicePrice } from "@/lib/pricing";
import { ServiceForm, type ServiceFormValues } from "./ServiceForm";

type Service = ServiceFormValues & { id: string; sortOrder: number };

const CATEGORY_LABELS: Record<string, string> = { PRIMARY: "Primary Services", ART_ADDON: "Nail Art & Add-Ons", REMOVAL: "Removal Services" };

const EMPTY: ServiceFormValues = {
  name: "",
  description: "",
  category: "PRIMARY",
  pricingType: "FIXED",
  priceFixed: 0,
  priceMin: null,
  priceMax: null,
  pricePerNail: null,
  priceFullSet: null,
  durationMinutes: 60,
  depositOverridePercentage: null,
  imageUrl: null,
  active: true,
};

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingCategory, setCreatingCategory] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(category: string, values: ServiceFormValues) {
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, category }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not create service.");
    setCreatingCategory(null);
    await load();
  }

  async function handleUpdate(id: string, values: ServiceFormValues) {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not update service.");
    setEditingId(null);
    await load();
  }

  async function toggleActive(s: Service) {
    await fetch(`/api/admin/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this service? If it has past bookings, it will be deactivated instead.")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    load();
  }

  async function move(category: string, index: number, direction: -1 | 1) {
    const list = services.filter((s) => s.category === category);
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const reordered = [...list];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await fetch("/api/admin/services/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((s) => s.id) }),
    });
    load();
  }

  if (loading) return <p className="text-sm text-medium-grey">Loading…</p>;

  return (
    <div className="flex flex-col gap-10">
      {(["PRIMARY", "ART_ADDON", "REMOVAL"] as const).map((category) => {
        const list = services.filter((s) => s.category === category);
        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-black">{CATEGORY_LABELS[category]}</h2>
              <Button size="sm" variant="secondary" onClick={() => setCreatingCategory(creatingCategory === category ? null : category)}>
                {creatingCategory === category ? "Close" : "+ Add Service"}
              </Button>
            </div>

            {creatingCategory === category && (
              <div className="mb-4">
                <ServiceForm
                  initial={{ ...EMPTY, category }}
                  submitLabel="Create Service"
                  onSubmit={(values) => handleCreate(category, values)}
                  onCancel={() => setCreatingCategory(null)}
                />
              </div>
            )}

            <div className="flex flex-col gap-3">
              {list.map((s, i) => {
                const { label, isEstimate } = describeServicePrice(s);
                return (
                  <Card key={s.id} className={`p-4 ${!s.active ? "opacity-60" : ""}`}>
                    {editingId === s.id ? (
                      <ServiceForm initial={s} submitLabel="Save Changes" onSubmit={(values) => handleUpdate(s.id, values)} onCancel={() => setEditingId(null)} />
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex flex-col">
                            <button disabled={i === 0} onClick={() => move(category, i, -1)} className="text-medium-grey disabled:opacity-30 text-xs">
                              ▲
                            </button>
                            <button disabled={i === list.length - 1} onClick={() => move(category, i, 1)} className="text-medium-grey disabled:opacity-30 text-xs">
                              ▼
                            </button>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-black truncate">{s.name}</p>
                            <p className="text-xs text-medium-grey">
                              {label}
                              {isEstimate ? " (estimate)" : ""} · {s.durationMinutes} min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!s.active && <Badge tone="neutral">Hidden</Badge>}
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(s.id)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => toggleActive(s)}>
                            {s.active ? "Hide" : "Show"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
              {list.length === 0 && <p className="text-sm text-medium-grey">No services in this category yet.</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
