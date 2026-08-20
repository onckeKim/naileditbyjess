import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";
import { resendReminder } from "@/lib/reminders";

export const GET = withAdmin(async () => {
  const logs = await prisma.reminderLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { booking: { select: { reference: true, clientName: true, requestedDate: true, requestedTime: true } } },
  });
  return NextResponse.json({ logs });
});

const resendSchema = z.object({ bookingId: z.string(), type: z.enum(["24H", "2H"]) });

export const POST = withAdmin(async (req) => {
  const parsed = resendSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 422 });

  await resendReminder(parsed.data.bookingId, parsed.data.type);
  return NextResponse.json({ ok: true });
});
