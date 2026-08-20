import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";
import { BOOKING_STATUS_LABELS, DEPOSIT_STATUS_LABELS, type BookingStatus, type DepositStatus } from "@/lib/types";
import { formatRand } from "@/lib/pricing";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export const GET = withAdmin(async (req) => {
  const status = req.nextUrl.searchParams.get("status");
  const depositStatus = req.nextUrl.searchParams.get("depositStatus");
  const serviceId = req.nextUrl.searchParams.get("serviceId");
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const format = req.nextUrl.searchParams.get("format");

  const bookings = await prisma.booking.findMany({
    where: {
      status: status && status !== "ALL" ? status : undefined,
      depositStatus: depositStatus && depositStatus !== "ALL" ? depositStatus : undefined,
      serviceId: serviceId && serviceId !== "ALL" ? serviceId : undefined,
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
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
    orderBy: [{ requestedDate: "asc" }, { requestedTime: "asc" }],
  });

  if (format === "csv") {
    const headers = [
      "Reference",
      "Status",
      "Deposit Status",
      "Client Name",
      "Client Email",
      "Client Phone",
      "Service",
      "Date",
      "Time",
      "Estimated Total",
      "Deposit Amount",
      "Remaining Balance",
      "Created At",
    ];
    const rows = bookings.map((b) =>
      [
        b.reference,
        BOOKING_STATUS_LABELS[b.status as BookingStatus] ?? b.status,
        DEPOSIT_STATUS_LABELS[b.depositStatus as DepositStatus] ?? b.depositStatus,
        b.clientName,
        b.clientEmail,
        b.clientPhone,
        b.service.name,
        b.requestedDate,
        b.requestedTime,
        formatRand(b.estimatedTotal),
        formatRand(b.depositAmount),
        formatRand(b.remainingBalance),
        b.createdAt.toISOString(),
      ]
        .map((v) => csvEscape(String(v)))
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ bookings });
});
