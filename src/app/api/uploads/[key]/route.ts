import { NextRequest, NextResponse } from "next/server";
import { getUploadsStore } from "@/lib/storage";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const store = getUploadsStore();
  const result = await store.getWithMetadata(key, { type: "arrayBuffer" });

  if (!result) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = typeof result.metadata?.contentType === "string" ? result.metadata.contentType : "application/octet-stream";

  return new NextResponse(result.data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
