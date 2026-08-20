import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/api-handler";
import { declineBooking } from "@/lib/booking-actions";

const schema = z.object({ reason: z.string().max(1000).optional() });

export const POST = withAdmin(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  const booking = await declineBooking(id, parsed.success ? parsed.data.reason : undefined);
  return NextResponse.json({ booking });
});
