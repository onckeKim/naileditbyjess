import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

export const GET = withAdmin(async (req) => {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const clients = await prisma.client.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] }
      : undefined,
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ clients });
});
