import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).default(""),
  category: z.enum(["PRIMARY", "ART_ADDON", "REMOVAL"]),
  pricingType: z.enum(["FIXED", "PER_NAIL", "PER_NAIL_OR_FULL_SET", "PER_NAIL_RANGE", "FULL_SET_ONLY", "RANGE"]),
  priceFixed: z.number().min(0).nullable().optional(),
  priceMin: z.number().min(0).nullable().optional(),
  priceMax: z.number().min(0).nullable().optional(),
  pricePerNail: z.number().min(0).nullable().optional(),
  priceFullSet: z.number().min(0).nullable().optional(),
  durationMinutes: z.number().int().min(5).max(600).default(60),
  depositOverridePercentage: z.number().int().min(0).max(100).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  active: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
