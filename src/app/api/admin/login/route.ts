import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminCredentials, createAdminSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(`login:${clientIp(req)}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email and password." }, { status: 422 });
  }

  const admin = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!admin) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createAdminSession(admin.id);
  return NextResponse.json({ ok: true });
}
