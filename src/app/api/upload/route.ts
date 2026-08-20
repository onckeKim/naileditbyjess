import { NextRequest, NextResponse } from "next/server";
import { saveUploadedImage } from "@/lib/storage";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(`upload:${clientIp(req)}`, 20, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many uploads from this device. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    const url = await saveUploadedImage(file);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
