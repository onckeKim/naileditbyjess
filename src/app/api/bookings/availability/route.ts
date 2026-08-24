import { NextRequest, NextResponse } from "next/server";
import { getBusyIntervals } from "@/lib/booking-service";
import { getSettings } from "@/lib/settings";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date || !DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date." }, { status: 422 });
  }

  const settings = await getSettings();
  const busy = await getBusyIntervals(date, settings.bufferMinutes);
  return NextResponse.json({ busy });
}
