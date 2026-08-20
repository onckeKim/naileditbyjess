import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

export const DELETE = withAdmin(async (_req, ctx) => {
  const { id } = await ctx.params;
  await prisma.blockedDate.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
});
