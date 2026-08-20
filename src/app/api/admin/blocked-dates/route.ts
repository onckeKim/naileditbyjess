import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(200).default(""),
});

export const GET = withAdmin(async () => {
  const dates = await prisma.blockedDate.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json({ dates });
});

export const POST = withAdmin(async (req) => {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please provide a valid date." }, { status: 422 });

  const existing = await prisma.blockedDate.findUnique({ where: { date: parsed.data.date } });
  if (existing) return NextResponse.json({ error: "This date is already blocked." }, { status: 409 });

  const date = await prisma.blockedDate.create({ data: parsed.data });
  return NextResponse.json({ date });
});
