import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, UnauthorizedError } from "./auth";
import { BookingError } from "./booking-service";
import { getBookingForToken } from "./tokens";
import type { AdminUser } from "@/generated/prisma/client";

type Ctx = { params: Promise<Record<string, string>> };

function handleError(err: unknown) {
  if (err instanceof UnauthorizedError) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }
  if (err instanceof BookingError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}

export function withAdmin(
  handler: (req: NextRequest, ctx: Ctx, admin: AdminUser) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: Ctx) => {
    try {
      const admin = await requireAdminApi();
      return await handler(req, ctx, admin);
    } catch (err) {
      return handleError(err);
    }
  };
}

/** For public routes under /api/manage/[token]/* — resolves and validates the token before calling the handler. */
export function withBookingToken(
  handler: (req: NextRequest, ctx: Ctx, bookingId: string) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: Ctx) => {
    try {
      const { token } = await ctx.params;
      const booking = await getBookingForToken(token);
      if (!booking) {
        return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 404 });
      }
      return await handler(req, ctx, booking.id);
    } catch (err) {
      return handleError(err);
    }
  };
}
