export type ServiceOption = {
  id: string;
  name: string;
  description: string;
  category: string;
  pricingType: string;
  priceFixed: number | null;
  priceMin: number | null;
  priceMax: number | null;
  pricePerNail: number | null;
  priceFullSet: number | null;
  durationMinutes: number;
  imageUrl: string | null;
  depositOverridePercentage: number | null;
};

export type AddOnSelectionState = {
  selected: boolean;
  mode: "PER_NAIL" | "FULL_SET";
  nailCount: number;
};
