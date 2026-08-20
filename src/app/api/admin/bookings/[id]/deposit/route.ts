import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/api-handler";
import { recordDeposit } from "@/lib/booking-actions";

const schema = z.object({
  depositStatus: z.enum(["NOT_REQUIRED", "AWAITING_DEPOSIT", "DEPOSIT_SUBMITTED", "DEPOSIT_PAID", "DEPOSIT_FAILED", "DEPOSIT_REFUNDED", "DEPOSIT_FORFEITED"]),
  method: z.string().max(100).optional(),
});

export const POST = withAdmin(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid deposit update." }, { status: 422 });

  const booking = await recordDeposit(id, parsed.data.depositStatus, parsed.data.method);
  return NextResponse.json({ booking });
});
