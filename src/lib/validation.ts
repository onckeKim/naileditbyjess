import { z } from "zod";

export const addOnSelectionSchema = z.object({
  serviceId: z.string().min(1),
  mode: z.enum(["PER_NAIL", "FULL_SET"]).optional(),
  nailCount: z.number().int().min(0).max(10).optional(),
});

export const createBookingSchema = z.object({
  serviceId: z.string().min(1),
  addOns: z.array(addOnSelectionSchema).max(20).default([]),
  requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  requestedTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  clientName: z.string().trim().min(2).max(120),
  clientEmail: z.string().trim().email(),
  clientPhone: z.string().trim().min(6).max(30),
  designNotes: z.string().trim().max(2000).optional().default(""),
  inspirationImageUrl: z.string().optional().nullable(),
  policyAccepted: z.literal(true),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
