import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withBookingToken } from "@/lib/api-handler";
import { createYocoCheckout, YocoError } from "@/lib/yoco";

export const POST = withBookingToken(async (_req, ctx, bookingId) => {
  const { token } = await ctx.params;
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.depositStatus !== "AWAITING_DEPOSIT") {
    return NextResponse.json({ error: "This booking isn't currently awaiting a deposit payment." }, { status: 409 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const manageUrl = `${siteUrl}/manage/${token}`;

  try {
    const { checkoutId, redirectUrl } = await createYocoCheckout({
      bookingId: booking.id,
      amountRand: booking.depositAmount,
      reference: booking.reference,
      successUrl: manageUrl,
      cancelUrl: manageUrl,
      failureUrl: manageUrl,
    });
    await prisma.booking.update({ where: { id: booking.id }, data: { yocoCheckoutId: checkoutId } });
    return NextResponse.json({ redirectUrl });
  } catch (err) {
    if (err instanceof YocoError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    throw err;
  }
});
