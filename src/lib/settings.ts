import { prisma } from "./prisma";

export async function getSettings() {
  const settings = await prisma.businessSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return settings;
}

export { parseBusinessHours, DAY_LABELS, type BusinessHours } from "./business-hours";
