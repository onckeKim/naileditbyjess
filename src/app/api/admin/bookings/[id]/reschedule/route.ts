import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/api-handler";
import { rescheduleBooking } from "@/lib/booking-actions";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export const POST = withAdmin(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please provide a valid date and time." }, { status: 422 });

  const booking = await rescheduleBooking(id, parsed.data.date, parsed.data.time);
  return NextResponse.json({ booking });
});
