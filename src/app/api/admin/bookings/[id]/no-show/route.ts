import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/api-handler";
import { markNoShow } from "@/lib/booking-actions";

const schema = z.object({ restrictClient: z.boolean().default(false), restrictionReason: z.string().max(500).optional() });

export const POST = withAdmin(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  const data = parsed.success ? parsed.data : { restrictClient: false, restrictionReason: undefined };
  const booking = await markNoShow(id, data.restrictClient, data.restrictionReason);
  return NextResponse.json({ booking });
});
