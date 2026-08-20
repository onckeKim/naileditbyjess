import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

const schema = z.object({ orderedIds: z.array(z.string()).min(1) });

export const POST = withAdmin(async (req) => {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order." }, { status: 422 });

  await prisma.$transaction(
    parsed.data.orderedIds.map((id, index) => prisma.service.update({ where: { id }, data: { sortOrder: index } }))
  );

  return NextResponse.json({ ok: true });
});
