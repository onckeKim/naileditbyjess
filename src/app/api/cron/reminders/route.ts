import { NextRequest, NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminders";

/**
 * Intended to be hit periodically (e.g. hourly) by an external scheduler —
 * this app has no built-in cron. See README "Appointment Reminders" for
 * setup instructions (Vercel Cron, GitHub Actions schedule, cron-job.org,
 * etc). Protected by CRON_SECRET so it can't be triggered by anyone who
 * finds the URL.
 */
function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // refuse to run wide open if no secret is configured
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  const queryToken = req.nextUrl.searchParams.get("secret");
  return queryToken === secret;
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized. Set CRON_SECRET and pass it as a Bearer token or ?secret=." }, { status: 401 });
  }

  const result = await sendDueReminders();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
