"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export type ServiceFormValues = {
  name: string;
  description: string;
  category: "PRIMARY" | "ART_ADDON" | "REMOVAL";
  pricingType: "FIXED" | "PER_NAIL" | "PER_NAIL_OR_FULL_SET" | "PER_NAIL_RANGE" | "FULL_SET_ONLY" | "RANGE";
  priceFixed: number | null;
  priceMin: number | null;
  priceMax: number | null;
  pricePerNail: number | null;
  priceFullSet: number | null;
  durationMinutes: number;
  depositOverridePercentage: number | null;
  imageUrl: string | null;
  active: boolean;
};

const PRICING_TYPE_LABELS: Record<ServiceFormValues["pricingType"], string> = {
  FIXED: "Fixed price",
  PER_NAIL: "Price per nail",
  PER_NAIL_OR_FULL_SET: "Per nail or full set",
  PER_NAIL_RANGE: "Per-nail price range",
  FULL_SET_ONLY: "Full set only",
  RANGE: "Price range",
};

export function ServiceForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: {
  initial: ServiceFormValues;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<ServiceFormValues>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      set("imageUrl", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  const t = values.pricingType;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-bg border border-marble rounded-lg p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs text-medium-grey mb-1">Name</label>
          <input required value={values.name} onChange={(e) => set("name", e.target.value)} className="w-full border border-marble rounded-sm px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-medium-grey mb-1">Description</label>
          <textarea value={values.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full border border-marble rounded-sm px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-medium-grey mb-1">Category</label>
          <select value={values.category} onChange={(e) => set("category", e.target.value as ServiceFormValues["category"])} className="w-full border border-marble rounded-sm px-3 py-2 text-sm">
            <option value="PRIMARY">Primary Service</option>
            <option value="ART_ADDON">Nail Art / Add-On</option>
            <option value="REMOVAL">Removal Service</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-medium-grey mb-1">Pricing Type</label>
          <select value={values.pricingType} onChange={(e) => set("pricingType", e.target.value as ServiceFormValues["pricingType"])} className="w-full border border-marble rounded-sm px-3 py-2 text-sm">
            {Object.entries(PRICING_TYPE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {t === "FIXED" && (
          <div>
            <label className="block text-xs text-medium-grey mb-1">Price (R)</label>
            <input type="number" min={0} step="0.01" value={values.priceFixed ?? ""} onChange={(e) => set("priceFixed", e.target.value ? Number(e.target.value) : null)} className="w-full border border-marble rounded-sm px-3 py-2 text-sm" />
          </div>
        )}
        {(t === "RANGE" || t === "PER_NAIL_RANGE") && (
          <>
            <div>
              <label className="block text-xs text-medium-grey mb-1">Min Price (R)</label>
              <input type="number" min={0} step="0.01" value={values.priceMin ?? ""} onChange={(e) => set("priceMin", e.target.value ? Number(e.target.value) : null)} className="w-full border border-marble rounded-sm px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-medium-grey mb-1">Max Price (R)</label>
              <input type="number" min={0} step="0.01" value={values.priceMax ?? ""} onChange={(e) => set("priceMax", e.target.value ? Number(e.target.value) : null)} className="w-full border border-marble rounded-sm px-3 py-2 text-sm" />
            </div>
          </>
        )}
        {(t === "PER_NAIL" || t === "PER_NAIL_OR_FULL_SET") && (
          <div>
            <label className="block text-xs text-medium-grey mb-1">Price Per Nail (R)</label>
            <input type="number" min={0} step="0.01" value={values.pricePerNail ?? ""} onChange={(e) => set("pricePerNail", e.target.value ? Number(e.target.value) : null)} className="w-full border border-marble rounded-sm px-3 py-2 text-sm" />
          </div>
        )}
        {(t === "PER_NAIL_OR_FULL_SET" || t === "FULL_SET_ONLY") && (
          <div>
            <label className="block text-xs text-medium-grey mb-1">Full Set Price (R)</label>
            <input type="number" min={0} step="0.01" value={values.priceFullSet ?? ""} onChange={(e) => set("priceFullSet", e.target.value ? Number(e.target.value) : null)} className="w-full border border-marble rounded-sm px-3 py-2 text-sm" />
          </div>
        )}

        <div>
          <label className="block text-xs text-medium-grey mb-1">Duration (minutes)</label>
          <input type="number" min={5} value={values.durationMinutes} onChange={(e) => set("durationMinutes", Number(e.target.value))} className="w-full border border-marble rounded-sm px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-medium-grey mb-1">Deposit Override % (optional)</label>
          <input type="number" min={0} max={100} value={values.depositOverridePercentage ?? ""} onChange={(e) => set("depositOverridePercentage", e.target.value ? Number(e.target.value) : null)} className="w-full border border-marble rounded-sm px-3 py-2 text-sm" placeholder="Uses global default" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs text-medium-grey mb-1">Image</label>
          <div className="flex items-center gap-3">
            {values.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={values.imageUrl} alt="" className="w-16 h-16 object-cover rounded border border-marble" />
            )}
            <label className="text-xs underline text-medium-grey cursor-pointer">
              {uploading ? "Uploading…" : values.imageUrl ? "Replace image" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </label>
            {values.imageUrl && (
              <button type="button" onClick={() => set("imageUrl", null)} className="text-xs underline text-medium-grey">
                Remove
              </button>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={values.active} onChange={(e) => set("active", e.target.checked)} className="accent-black" />
          Active (visible to clients)
        </label>
      </div>

      {error && <p className="text-error text-sm bg-error/10 border border-error/30 rounded-sm px-3 py-2">{error}</p>}

      <div className="flex gap-2">
        <Button size="sm" type="submit" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
