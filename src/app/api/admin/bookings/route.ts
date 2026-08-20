import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

export const GET = withAdmin(async (req) => {
  const status = req.nextUrl.searchParams.get("status");
  const q = req.nextUrl.searchParams.get("q")?.trim();

  const bookings = await prisma.booking.findMany({
    where: {
      status: status && status !== "ALL" ? status : undefined,
      OR: q
        ? [
            { reference: { contains: q } },
            { clientName: { contains: q } },
            { clientEmail: { contains: q } },
            { clientPhone: { contains: q } },
          ]
        : undefined,
    },
    include: {
      service: true,
      client: true,
      addOns: { include: { service: true } },
      policyAcceptance: true,
    },
    orderBy: [{ requestedDate: "asc" }, { requestedTime: "asc" }],
  });

  return NextResponse.json({ bookings });
});
