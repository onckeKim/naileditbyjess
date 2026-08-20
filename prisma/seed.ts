import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const primaryServices = [
  {
    name: "Manicure",
    description: "A classic hand manicure — shaping, cuticle care, and a polish finish.",
    pricingType: "FIXED",
    priceFixed: 90,
    durationMinutes: 45,
  },
  {
    name: "Gel Overlay Hands",
    description: "A strengthening gel overlay applied over your natural nails for a durable, glossy finish.",
    pricingType: "FIXED",
    priceFixed: 190,
    durationMinutes: 75,
  },
  {
    name: "Gel Overlay Toes",
    description: "A long-lasting gel overlay for your toenails, finished to a smooth, glossy shine.",
    pricingType: "FIXED",
    priceFixed: 170,
    durationMinutes: 60,
  },
  {
    name: "Gel Extensions",
    description: "Sculpted gel extensions built to your desired length and shape.",
    pricingType: "FIXED",
    priceFixed: 290,
    durationMinutes: 120,
  },
  {
    name: "Gel Extensions 3 or 4 Week Fill",
    description: "A fill and refresh for existing gel extensions to keep your set looking flawless.",
    pricingType: "FIXED",
    priceFixed: 330,
    durationMinutes: 90,
  },
  {
    name: "Gel Extensions Mystery Set",
    description: "A surprise design set — sit back and let Jess create something unique for you.",
    pricingType: "FIXED",
    priceFixed: 350,
    durationMinutes: 120,
  },
  {
    name: "Deluxe Pedi",
    description: "Soak, scrub, foot massage, and gel overlay toes.",
    pricingType: "FIXED",
    priceFixed: 380,
    durationMinutes: 90,
  },
  {
    name: "Mini Pedi",
    description: "Soak, scrub, and foot massage.",
    pricingType: "FIXED",
    priceFixed: 280,
    durationMinutes: 45,
  },
];

const addOnServices = [
  {
    name: "French Tips or Ombré",
    description: "A timeless French tip or soft ombré fade, priced per nail or as a full set.",
    pricingType: "PER_NAIL_OR_FULL_SET",
    pricePerNail: 10,
    priceFullSet: 60,
    durationMinutes: 20,
  },
  {
    name: "Airbrush",
    description: "Airbrushed colour and effects, priced per nail or as a full set.",
    pricingType: "PER_NAIL_OR_FULL_SET",
    pricePerNail: 10,
    priceFullSet: 60,
    durationMinutes: 20,
  },
  {
    name: "Freehand Art",
    description: "Custom hand-painted nail art, priced per nail depending on design complexity.",
    pricingType: "PER_NAIL_RANGE",
    priceMin: 10,
    priceMax: 15,
    durationMinutes: 20,
  },
  {
    name: "3D Art",
    description: "Sculpted 3D embellishments and detailing, priced per nail depending on design complexity.",
    pricingType: "PER_NAIL_RANGE",
    priceMin: 10,
    priceMax: 15,
    durationMinutes: 20,
  },
  {
    name: "Chrome",
    description: "A mirror-like chrome finish applied across a full set.",
    pricingType: "FULL_SET_ONLY",
    priceFullSet: 30,
    durationMinutes: 15,
  },
  {
    name: "Glitters and Foils",
    description: "Glitter or foil accents, priced per nail.",
    pricingType: "PER_NAIL",
    pricePerNail: 5,
    durationMinutes: 10,
  },
];

const removalServices = [
  {
    name: "Gel Overlay Soak-Off",
    description: "Safe removal of an existing gel overlay.",
    pricingType: "FIXED",
    priceFixed: 60,
    durationMinutes: 30,
  },
  {
    name: "Gel Extensions Soak-Off",
    description: "Safe removal of existing gel extensions.",
    pricingType: "FIXED",
    priceFixed: 80,
    durationMinutes: 30,
  },
  {
    name: "Foreign Product Soak-Off",
    description: "Removal of gel or acrylic product applied by another salon or technician.",
    pricingType: "FIXED",
    priceFixed: 100,
    durationMinutes: 40,
  },
];

async function main() {
  console.log("Seeding Nailed It Jess database...");

  // The seeded hours below are placeholders — treat seeding them as the
  // administrator's initial setup step, which is why bookingEnabled is
  // switched on here. Any BusinessSettings row created outside this seed
  // script defaults to bookingEnabled: false per the schema, so booking
  // stays closed until a real admin explicitly reviews and enables it.
  await prisma.businessSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, bookingEnabled: true },
  });

  let sortOrder = 0;
  for (const s of primaryServices) {
    await prisma.service.upsert({
      where: { slug: slugify(s.name) },
      update: {},
      create: {
        ...s,
        slug: slugify(s.name),
        category: "PRIMARY",
        sortOrder: sortOrder++,
        depositOverridePercentage: null,
      },
    });
  }

  sortOrder = 0;
  for (const s of addOnServices) {
    await prisma.service.upsert({
      where: { slug: slugify(s.name) },
      update: {},
      create: {
        ...s,
        slug: slugify(s.name),
        category: "ART_ADDON",
        sortOrder: sortOrder++,
      },
    });
  }

  sortOrder = 0;
  for (const s of removalServices) {
    await prisma.service.upsert({
      where: { slug: slugify(s.name) },
      update: {},
      create: {
        ...s,
        slug: slugify(s.name),
        category: "REMOVAL",
        sortOrder: sortOrder++,
      },
    });
  }

  const galleryCaptions = [
    "Chrome French set",
    "Soft ombré gel extensions",
    "Freehand floral art",
    "Deluxe pedi finish",
    "Glitter accent set",
    "Classic gel overlay",
  ];
  for (let i = 0; i < galleryCaptions.length; i++) {
    const existing = await prisma.galleryImage.findFirst({ where: { caption: galleryCaptions[i] } });
    if (!existing) {
      await prisma.galleryImage.create({
        data: { imageUrl: "", caption: galleryCaptions[i], sortOrder: i, active: true },
      });
    }
  }

  const reviews = [
    { clientName: "Amahle N.", rating: 5, text: "Jess is so talented — my gel extensions lasted a full month without a single lift. The whole process felt so professional.", approved: true, featured: true },
    { clientName: "Tarryn P.", rating: 5, text: "Booking online was so easy and the freehand art on my nails was even better than the photo I sent through.", approved: true, featured: true },
    { clientName: "Zanele M.", rating: 5, text: "Absolutely love my nails every single time. The studio is spotless and Jess always makes sure I know exactly what to expect.", approved: true, featured: true },
    { clientName: "Chloe R.", rating: 4, text: "Great experience from booking to the appointment itself. Deposit process was clear and simple.", approved: true, featured: false },
  ];
  for (const r of reviews) {
    const existing = await prisma.review.findFirst({ where: { clientName: r.clientName, text: r.text } });
    if (!existing) await prisma.review.create({ data: r });
  }

  const adminEmail = process.env.ADMIN_SEED_EMAIL || "onckekim@gmail.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "NailedItJess2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash, name: "Jess" },
  });

  console.log("Seed complete.");
  console.log(`Admin login -> email: ${adminEmail} / password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
