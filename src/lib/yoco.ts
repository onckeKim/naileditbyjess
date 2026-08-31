import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const YOCO_API_BASE = "https://payments.yoco.com/api";

export class YocoError extends Error {}

/**
 * Creates a Yoco hosted checkout for a booking's deposit. Returns the URL to
 * redirect the client to. Payment confirmation happens via webhook
 * (see verifyYocoWebhookSignature + the /api/webhooks/yoco route) — the
 * successUrl redirect is just where the browser lands, it is never trusted
 * as proof of payment on its own.
 */
export async function createYocoCheckout(opts: {
  bookingId: string;
  amountRand: number;
  reference: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
}) {
  const secretKey = process.env.YOCO_SECRET_KEY;
  if (!secretKey) {
    throw new YocoError("Online card payments are not set up yet. Please pay by EFT using the details in your email.");
  }

  const res = await fetch(`${YOCO_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(opts.amountRand * 100),
      currency: "ZAR",
      successUrl: opts.successUrl,
      cancelUrl: opts.cancelUrl,
      failureUrl: opts.failureUrl,
      metadata: { bookingId: opts.bookingId, reference: opts.reference },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Yoco checkout creation failed", res.status, body);
    throw new YocoError("Unable to start payment right now. Please try again shortly, or pay by EFT.");
  }

  const data = (await res.json()) as { id: string; redirectUrl: string };
  return { checkoutId: data.id, redirectUrl: data.redirectUrl };
}

/**
 * Verifies a Yoco webhook request using the Standard Webhooks scheme Yoco
 * implements: HMAC-SHA256 over "{id}.{timestamp}.{rawBody}", keyed by the
 * base64-decoded portion of the whsec_-prefixed signing secret, compared
 * against the space-separated "v1,<base64sig>" values in webhook-signature.
 */
export function verifyYocoWebhookSignature(opts: {
  id: string | null;
  timestamp: string | null;
  signatureHeader: string | null;
  rawBody: string;
  secret: string;
}) {
  const { id, timestamp, signatureHeader, rawBody, secret } = opts;
  if (!id || !timestamp || !signatureHeader) return false;

  // Reject stale/replayed deliveries (>5 minutes old).
  const tsSeconds = Number(timestamp);
  if (!Number.isFinite(tsSeconds) || Math.abs(Date.now() / 1000 - tsSeconds) > 5 * 60) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secretBytes).update(signedContent).digest("base64");
  const expectedBuf = Buffer.from(expected);

  return signatureHeader
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter(Boolean)
    .some((sig) => {
      const sigBuf = Buffer.from(sig, "base64");
      return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
    });
}
