import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyYocoWebhookSignature } from "@/lib/yoco";
import { recordDeposit } from "@/lib/booking-actions";

export async function POST(req: NextRequest) {
  const secret = process.env.YOCO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Received Yoco webhook but YOCO_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const rawBody = await req.text();
  const verified = verifyYocoWebhookSignature({
    id: req.headers.get("webhook-id"),
    timestamp: req.headers.get("webhook-timestamp"),
    signatureHeader: req.headers.get("webhook-signature"),
    rawBody,
    secret,
  });
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: { type?: string; payload?: { metadata?: { bookingId?: string; checkoutId?: string } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const bookingId = event.payload?.metadata?.bookingId;
  const checkoutId = event.payload?.metadata?.checkoutId;
  const booking = bookingId
    ? await prisma.booking.findUnique({ where: { id: bookingId } })
    : checkoutId
      ? await prisma.booking.findUnique({ where: { yocoCheckoutId: checkoutId } })
      : null;

  if (!booking) {
    // Ack anyway — nothing to retry, and we don't want Yoco hammering this endpoint.
    return NextResponse.json({ received: true });
  }

  if (event.type === "payment.succeeded" && booking.depositStatus !== "DEPOSIT_PAID") {
    await recordDeposit(booking.id, "DEPOSIT_PAID", "YOCO");
  } else if (event.type === "payment.failed" && booking.depositStatus === "AWAITING_DEPOSIT") {
    await recordDeposit(booking.id, "DEPOSIT_FAILED", "YOCO");
  }

  return NextResponse.json({ received: true });
}
