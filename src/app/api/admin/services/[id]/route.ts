import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api-handler";
import { serviceSchema } from "@/lib/service-validation";

export const PATCH = withAdmin(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = serviceSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the service details." }, { status: 422 });

  const service = await prisma.service.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ service });
});

export const DELETE = withAdmin(async (_req, ctx) => {
  const { id } = await ctx.params;
  const [bookingCount, addOnCount] = await Promise.all([
    prisma.booking.count({ where: { serviceId: id } }),
    prisma.bookingAddOn.count({ where: { serviceId: id } }),
  ]);
  if (bookingCount > 0 || addOnCount > 0) {
    await prisma.service.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ deactivated: true });
  }
  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
});
