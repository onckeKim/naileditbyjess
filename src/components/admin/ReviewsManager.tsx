"use client";

import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";

type Review = {
  id: string;
  clientName: string;
  rating: number;
  text: string;
  approved: boolean;
  featured: boolean;
  imageUrl: string | null;
  serviceId: string | null;
  service: { name: string } | null;
};

const EMPTY = { clientName: "", rating: 5, text: "", approved: true, featured: false, imageUrl: null as string | null, serviceId: "" };

export function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((d) => setServices((d.services || []).map((s: { id: string; name: string }) => ({ id: s.id, name: s.name }))));
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setForm((f) => ({ ...f, imageUrl: data.url }));
    } finally {
      setUploading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, serviceId: form.serviceId || null }),
    });
    setForm(EMPTY);
    setCreating(false);
    load();
  }

  async function toggle(r: Review, field: "approved" | "featured") {
    await fetch(`/api/admin/reviews/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !r[field] }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <Button size="sm" variant="secondary" onClick={() => setCreating((v) => !v)}>
          {creating ? "Close" : "+ Add Review"}
        </Button>
      </div>

      {creating && (
        <Card className="p-5 mb-6">
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="Client name" value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} className="border border-marble rounded-sm px-3 py-2 text-sm" />
              <select value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="border border-marble rounded-sm px-3 py-2 text-sm">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </div>
            <textarea required placeholder="Review text" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} rows={3} className="border border-marble rounded-sm px-3 py-2 text-sm" />
            <select value={form.serviceId} onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))} className="border border-marble rounded-sm px-3 py-2 text-sm">
              <option value="">No linked service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3">
              {form.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="" className="w-14 h-14 object-cover rounded border border-marble" />
              )}
              <label className="text-xs underline text-medium-grey cursor-pointer">
                {uploading ? "Uploading…" : "Upload nail photo (optional)"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              </label>
            </div>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={form.approved} onChange={(e) => setForm((f) => ({ ...f, approved: e.target.checked }))} className="accent-black" /> Approved
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="accent-black" /> Featured on home page
              </label>
            </div>
            <div>
              <Button size="sm" type="submit">
                Save Review
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-medium-grey">Loading…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  {r.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.imageUrl} alt="" className="w-14 h-14 object-cover rounded border border-marble shrink-0" />
                  )}
                  <div>
                    <StarRating rating={r.rating} />
                    <p className="text-sm text-charcoal mt-1">{r.text}</p>
                    <p className="text-xs text-medium-grey mt-1">
                      {r.clientName}
                      {r.service ? ` · ${r.service.name}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-1">
                    {r.approved && <Badge tone="success">Approved</Badge>}
                    {r.featured && <Badge tone="black">Featured</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => toggle(r, "approved")}>
                      {r.approved ? "Unapprove" : "Approve"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggle(r, "featured")}>
                      {r.featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {reviews.length === 0 && <p className="text-sm text-medium-grey">No reviews yet.</p>}
        </div>
      )}
    </div>
  );
}
