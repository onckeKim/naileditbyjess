import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

const schema = z.object({
  restricted: z.boolean(),
  restrictionReason: z.string().max(500).nullable().optional(),
});

export const GET = withAdmin(async (_req, ctx) => {
  const { id } = await ctx.params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: { bookings: { include: { service: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  return NextResponse.json({ client });
});

export const PATCH = withAdmin(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 422 });

  const client = await prisma.client.update({
    where: { id },
    data: {
      restricted: parsed.data.restricted,
      restrictionReason: parsed.data.restricted ? parsed.data.restrictionReason ?? undefined : null,
    },
  });
  return NextResponse.json({ client });
});
