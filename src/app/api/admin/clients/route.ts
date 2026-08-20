import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export const GET = withAdmin(async (req) => {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const format = req.nextUrl.searchParams.get("format");

  const clients = await prisma.client.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] }
      : undefined,
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const headers = ["Name", "Email", "Phone", "Restricted", "Restriction Reason", "Bookings", "Created At"];
    const rows = clients.map((c) =>
      [c.name, c.email, c.phone, c.restricted ? "Yes" : "No", c.restrictionReason ?? "", String(c._count.bookings), c.createdAt.toISOString()]
        .map((v) => csvEscape(String(v)))
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="clients-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ clients });
});
