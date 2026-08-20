import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addOnSelectionSchema } from "@/lib/validation";
import { quoteBooking, BookingError } from "@/lib/booking-service";

const quoteSchema = z.object({
  serviceId: z.string().min(1),
  addOns: z.array(addOnSelectionSchema).max(20).default([]),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid selection." }, { status: 422 });
  }

  try {
    const quote = await quoteBooking(parsed.data.serviceId, parsed.data.addOns);
    return NextResponse.json({
      serviceName: quote.service.name,
      serviceSubtotal: quote.serviceSubtotal,
      addOnsTotal: quote.addOnsTotal,
      estimatedTotal: quote.estimatedTotal,
      isEstimate: quote.isEstimate,
      depositPercentage: quote.depositPercentage,
      depositAmount: quote.depositAmount,
      remainingBalance: quote.remainingBalance,
      addOnDetails: quote.addOnDetails.map((d) => ({
        serviceId: d.service.id,
        name: d.service.name,
        detail: d.detail,
        price: d.price,
        isEstimate: d.isEstimate,
      })),
    });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Unable to calculate quote." }, { status: 500 });
  }
}
