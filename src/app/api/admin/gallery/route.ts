import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

const schema = z.object({
  imageUrl: z.string().min(1),
  caption: z.string().max(200).default(""),
});

export const GET = withAdmin(async () => {
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ images });
});

export const POST = withAdmin(async (req) => {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please provide an image." }, { status: 422 });

  const maxSort = await prisma.galleryImage.aggregate({ _max: { sortOrder: true } });
  const image = await prisma.galleryImage.create({
    data: { ...parsed.data, sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
  });
  return NextResponse.json({ image });
});
