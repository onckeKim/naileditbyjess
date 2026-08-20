import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";
import { serviceSchema } from "@/lib/service-validation";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const GET = withAdmin(async () => {
  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
  return NextResponse.json({ services });
});

export const POST = withAdmin(async (req) => {
  const parsed = serviceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the service details.", issues: parsed.error.issues }, { status: 422 });

  const data = parsed.data;
  let slug = slugify(data.name);
  const existing = await prisma.service.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const maxSort = await prisma.service.aggregate({ where: { category: data.category }, _max: { sortOrder: true } });

  const service = await prisma.service.create({
    data: { ...data, slug, sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
  });

  return NextResponse.json({ service });
});
