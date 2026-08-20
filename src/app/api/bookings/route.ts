import { NextRequest, NextResponse } from "next/server";
import { createBookingSchema } from "@/lib/validation";
import { createBookingRequest, BookingError } from "@/lib/booking-service";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again.", issues: parsed.error.issues }, { status: 422 });
  }

  try {
    const booking = await createBookingRequest(parsed.data);
    return NextResponse.json({
      reference: booking.reference,
      estimatedTotal: booking.estimatedTotal,
      depositAmount: booking.depositAmount,
      remainingBalance: booking.remainingBalance,
    });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong submitting your request. Please try again." }, { status: 500 });
  }
}
