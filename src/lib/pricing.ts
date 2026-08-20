import type { PricingType } from "./types";

export type ServiceLike = {
  pricingType: string;
  priceFixed: number | null;
  priceMin: number | null;
  priceMax: number | null;
  pricePerNail: number | null;
  priceFullSet: number | null;
};

export type AddOnSelection = {
  serviceId: string;
  mode?: "PER_NAIL" | "FULL_SET";
  nailCount?: number;
};

export function formatRand(amount: number) {
  const rounded = Math.round(amount * 100) / 100;
  return `R${rounded.toLocaleString("en-ZA", { minimumFractionDigits: rounded % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

/** Human-readable price display for a service card, plus whether the figure is an estimate. */
export function describeServicePrice(service: ServiceLike): { label: string; isEstimate: boolean } {
  const type = service.pricingType as PricingType;
  switch (type) {
    case "FIXED":
      return { label: formatRand(service.priceFixed ?? 0), isEstimate: false };
    case "RANGE":
      return {
        label: `${formatRand(service.priceMin ?? 0)} – ${formatRand(service.priceMax ?? 0)}`,
        isEstimate: true,
      };
    case "PER_NAIL":
      return { label: `${formatRand(service.pricePerNail ?? 0)} per nail`, isEstimate: false };
    case "PER_NAIL_RANGE":
      return {
        label: `${formatRand(service.priceMin ?? 0)}–${formatRand(service.priceMax ?? 0)} per nail`,
        isEstimate: true,
      };
    case "PER_NAIL_OR_FULL_SET":
      return {
        label: `${formatRand(service.pricePerNail ?? 0)} per nail or ${formatRand(service.priceFullSet ?? 0)} full set`,
        isEstimate: false,
      };
    case "FULL_SET_ONLY":
      return { label: `${formatRand(service.priceFullSet ?? 0)} per full set`, isEstimate: false };
    default:
      return { label: "Price on request", isEstimate: true };
  }
}

/** Calculates the price contribution of a single add-on given the client's selection. */
export function calculateAddOnPrice(
  service: ServiceLike,
  selection: { mode?: "PER_NAIL" | "FULL_SET"; nailCount?: number }
): { price: number; isEstimate: boolean; detail: string } {
  const type = service.pricingType as PricingType;
  const nailCount = Math.max(0, Math.min(10, selection.nailCount ?? 0));

  switch (type) {
    case "FIXED":
      return { price: service.priceFixed ?? 0, isEstimate: false, detail: formatRand(service.priceFixed ?? 0) };
    case "PER_NAIL": {
      const price = (service.pricePerNail ?? 0) * nailCount;
      return { price, isEstimate: false, detail: `${nailCount} nail${nailCount === 1 ? "" : "s"} × ${formatRand(service.pricePerNail ?? 0)}` };
    }
    case "PER_NAIL_RANGE": {
      const min = (service.priceMin ?? 0) * nailCount;
      const max = (service.priceMax ?? 0) * nailCount;
      return { price: max, isEstimate: true, detail: `${nailCount} nail${nailCount === 1 ? "" : "s"} × ${formatRand(service.priceMin ?? 0)}–${formatRand(service.priceMax ?? 0)} (est. ${formatRand(min)}–${formatRand(max)})` };
    }
    case "PER_NAIL_OR_FULL_SET": {
      if (selection.mode === "FULL_SET") {
        return { price: service.priceFullSet ?? 0, isEstimate: false, detail: `Full set — ${formatRand(service.priceFullSet ?? 0)}` };
      }
      const price = (service.pricePerNail ?? 0) * nailCount;
      return { price, isEstimate: false, detail: `${nailCount} nail${nailCount === 1 ? "" : "s"} × ${formatRand(service.pricePerNail ?? 0)}` };
    }
    case "FULL_SET_ONLY":
      return { price: service.priceFullSet ?? 0, isEstimate: false, detail: `Full set — ${formatRand(service.priceFullSet ?? 0)}` };
    case "RANGE":
      return { price: service.priceMax ?? 0, isEstimate: true, detail: `Est. ${formatRand(service.priceMin ?? 0)}–${formatRand(service.priceMax ?? 0)}` };
    default:
      return { price: 0, isEstimate: true, detail: "Price on request" };
  }
}

export function calculateMainServicePrice(service: ServiceLike): { price: number; isEstimate: boolean } {
  const type = service.pricingType as PricingType;
  if (type === "RANGE") return { price: service.priceMax ?? 0, isEstimate: true };
  if (type === "FIXED") return { price: service.priceFixed ?? 0, isEstimate: false };
  return { price: service.priceFixed ?? 0, isEstimate: false };
}

export function calculateDeposit(total: number, percentage: number) {
  const deposit = Math.round((total * percentage) / 100);
  const remaining = Math.round((total - deposit) * 100) / 100;
  return { deposit, remaining };
}
