import { NextResponse } from "next/server";
import { z } from "zod";
import { withBookingToken } from "@/lib/api-handler";
import { cancelBooking } from "@/lib/booking-actions";

const schema = z.object({ reason: z.string().max(500).optional() });

export const POST = withBookingToken(async (req, _ctx, bookingId) => {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  const booking = await cancelBooking(bookingId, parsed.success ? parsed.data.reason : undefined, "CLIENT");
  return NextResponse.json({ booking });
});
