import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

const schema = z.object({
  imageUrl: z.string().min(1).optional(),
  caption: z.string().max(200).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const PATCH = withAdmin(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 422 });

  const image = await prisma.galleryImage.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ image });
});

export const DELETE = withAdmin(async (_req, ctx) => {
  const { id } = await ctx.params;
  await prisma.galleryImage.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
});
