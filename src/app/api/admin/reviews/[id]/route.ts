import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

const schema = z.object({
  clientName: z.string().trim().min(1).max(120).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  text: z.string().trim().min(1).max(2000).optional(),
  approved: z.boolean().optional(),
  featured: z.boolean().optional(),
  imageUrl: z.string().nullable().optional(),
  serviceId: z.string().nullable().optional(),
});

export const PATCH = withAdmin(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 422 });

  const review = await prisma.review.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ review });
});

export const DELETE = withAdmin(async (_req, ctx) => {
  const { id } = await ctx.params;
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
});
