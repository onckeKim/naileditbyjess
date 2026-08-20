import { NextResponse } from "next/server";
import { z } from "zod";
import { withBookingToken } from "@/lib/api-handler";
import { respondToProposal } from "@/lib/booking-actions";

const schema = z.object({ accept: z.boolean() });

export const POST = withBookingToken(async (req, _ctx, bookingId) => {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 422 });

  const booking = await respondToProposal(bookingId, parsed.data.accept, "CLIENT");
  return NextResponse.json({ booking });
});
