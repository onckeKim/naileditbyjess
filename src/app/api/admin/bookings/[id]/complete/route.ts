import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-handler";
import { markCompleted } from "@/lib/booking-actions";

export const POST = withAdmin(async (_req, ctx) => {
  const { id } = await ctx.params;
  const booking = await markCompleted(id);
  return NextResponse.json({ booking });
});
