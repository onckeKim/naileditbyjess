import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

const patchSchema = z.object({
  adminNotes: z.string().max(4000).optional(),
  cancellationFeeStatus: z.enum(["NONE", "SATISFIED_BY_DEPOSIT", "ADDITIONAL_FEE_DUE", "FEE_PAID", "MANUAL_REVIEW"]).optional(),
  cancellationFeeAmount: z.number().min(0).nullable().optional(),
  depositStatus: z
    .enum(["NOT_REQUIRED", "AWAITING_DEPOSIT", "DEPOSIT_SUBMITTED", "DEPOSIT_PAID", "DEPOSIT_FAILED", "DEPOSIT_REFUNDED", "DEPOSIT_FORFEITED"])
    .optional(),
  depositMethod: z.string().max(100).nullable().optional(),
});

export const GET = withAdmin(async (_req, ctx) => {
  const { id } = await ctx.params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
      client: true,
      addOns: { include: { service: true } },
      policyAcceptance: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  return NextResponse.json({ booking });
});

export const PATCH = withAdmin(async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 422 });

  const booking = await prisma.booking.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ booking });
});
