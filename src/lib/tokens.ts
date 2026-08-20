import "server-only";
import { randomBytes, createHash } from "crypto";
import { prisma } from "./prisma";

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Creates a secure "manage my booking" link for a client. The raw token is
 * only ever included in the emailed URL — only its SHA-256 hash is stored,
 * so a database read alone can never recover a usable token.
 */
export async function createManageBookingToken(bookingId: string, expiryDays = 30) {
  const raw = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  await prisma.bookingActionToken.create({
    data: { tokenHash: hashToken(raw), bookingId, expiresAt },
  });

  return raw;
}

export function manageBookingUrl(rawToken: string, baseUrl?: string) {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/manage/${rawToken}`;
}

/** Looks up the booking for a raw token, or null if invalid/expired. Does not mutate anything. */
export async function getBookingForToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const token = await prisma.bookingActionToken.findUnique({
    where: { tokenHash },
    include: {
      booking: {
        include: { service: true, addOns: { include: { service: true } }, policyAcceptance: true, client: true },
      },
    },
  });

  if (!token) return null;
  if (token.expiresAt < new Date()) return null;

  await prisma.bookingActionToken.update({ where: { id: token.id }, data: { lastUsedAt: new Date() } });

  return token.booking;
}
