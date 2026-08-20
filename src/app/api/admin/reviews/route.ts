import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

const schema = z.object({
  clientName: z.string().trim().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(1).max(2000),
  approved: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const GET = withAdmin(async () => {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ reviews });
});

export const POST = withAdmin(async (req) => {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the review details." }, { status: 422 });

  const review = await prisma.review.create({ data: parsed.data });
  return NextResponse.json({ review });
});
