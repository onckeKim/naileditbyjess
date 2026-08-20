import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, UnauthorizedError } from "./auth";
import { BookingError } from "./booking-service";
import type { AdminUser } from "@/generated/prisma/client";

type Ctx = { params: Promise<Record<string, string>> };

export function withAdmin(
  handler: (req: NextRequest, ctx: Ctx, admin: AdminUser) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: Ctx) => {
    try {
      const admin = await requireAdminApi();
      return await handler(req, ctx, admin);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return NextResponse.json({ error: "Please log in." }, { status: 401 });
      }
      if (err instanceof BookingError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
  };
}
