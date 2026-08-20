import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/api-handler";
import { respondToProposal } from "@/lib/booking-actions";

const schema = z.object({ accept: z.boolean() });

export const POST = withAdmin(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 422 });

  const booking = await respondToProposal(id, parsed.data.accept, "ADMIN");
  return NextResponse.json({ booking });
});
