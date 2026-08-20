import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

const schema = z.object({
  businessName: z.string().trim().min(1).max(150).optional(),
  established: z.string().trim().max(20).optional(),
  whatsapp: z.string().trim().max(30).optional(),
  instagram: z.string().trim().max(60).optional(),
  contactEmail: z.string().trim().max(150).optional(),
  address: z.string().trim().max(300).optional(),
  logoUrl: z.string().nullable().optional(),
  heroHeading: z.string().trim().max(200).optional(),
  heroSubtext: z.string().trim().max(600).optional(),
  heroImageUrl: z.string().nullable().optional(),
  aboutBio: z.string().trim().max(3000).optional(),
  aboutQualifications: z.string().trim().max(2000).optional(),
  aboutLocation: z.string().trim().max(500).optional(),
  aboutYearsExperience: z.string().trim().max(100).optional(),
  businessHours: z.string().optional(),
  depositPercentage: z.number().int().min(0).max(100).optional(),
  lateCancellationHours: z.number().int().min(0).max(240).optional(),
  lateCancellationFeePercentage: z.number().int().min(0).max(100).optional(),
  cancellationFeeMode: z.enum(["FORFEIT_SATISFIES", "ADDITIONAL_FEE", "MANUAL_REVIEW"]).optional(),
  cancellationPolicyText: z.string().trim().max(6000).optional(),
  policyVersion: z.string().trim().max(40).optional(),
  eftDetails: z.string().trim().max(1000).optional(),

  businessPhone: z.string().trim().max(30).optional(),
  addressPublic: z.boolean().optional(),
  faq: z.string().optional(),
  declineReasonTemplates: z.string().optional(),
  prepareForAppointmentText: z.string().trim().max(3000).optional(),

  bookingEnabled: z.boolean().optional(),
  minNoticeHours: z.number().int().min(0).max(720).optional(),
  maxAdvanceDays: z.number().int().min(1).max(365).optional(),
  bufferMinutes: z.number().int().min(0).max(240).optional(),
  proposalExpiryHours: z.number().int().min(1).max(720).optional(),

  remindersEnabled: z.boolean().optional(),
  remind24hEnabled: z.boolean().optional(),
  remind2hEnabled: z.boolean().optional(),
  remind24hMessage: z.string().trim().max(500).optional(),
  remind2hMessage: z.string().trim().max(500).optional(),

  nailRepairsPolicyText: z.string().trim().max(3000).optional(),
  nailRepairsPolicyPublished: z.boolean().optional(),
  guestsChildrenPolicyText: z.string().trim().max(3000).optional(),
  guestsChildrenPolicyPublished: z.boolean().optional(),
  healthAllergyPolicyText: z.string().trim().max(3000).optional(),
  healthAllergyPolicyPublished: z.boolean().optional(),
});

export const GET = withAdmin(async () => {
  const settings = await prisma.businessSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  return NextResponse.json({ settings });
});

export const PATCH = withAdmin(async (req) => {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the settings form.", issues: parsed.error.issues }, { status: 422 });

  const settings = await prisma.businessSettings.update({ where: { id: 1 }, data: parsed.data });
  return NextResponse.json({ settings });
});
