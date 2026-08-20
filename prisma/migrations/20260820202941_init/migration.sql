-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "businessName" TEXT NOT NULL DEFAULT 'Nailed It Jess',
    "established" TEXT NOT NULL DEFAULT '2021',
    "whatsapp" TEXT NOT NULL DEFAULT '060 504 2759',
    "instagram" TEXT NOT NULL DEFAULT '@_nailed_it_jess',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT,
    "heroHeading" TEXT NOT NULL DEFAULT 'Your next nail set starts here.',
    "heroSubtext" TEXT NOT NULL DEFAULT 'Discover professional nail services designed to match your style. Browse our work, choose your service, and request your preferred appointment online.',
    "heroImageUrl" TEXT,
    "aboutBio" TEXT NOT NULL DEFAULT 'Welcome to Nailed It Jess, a professional nail service established in 2021. Every appointment is approached with care, creativity, and attention to detail, helping each client leave with a nail set that reflects their style.',
    "aboutQualifications" TEXT NOT NULL DEFAULT 'Trained and experienced in gel overlays, gel extensions, and nail art application.',
    "aboutLocation" TEXT NOT NULL DEFAULT 'By appointment — location details shared upon booking confirmation.',
    "aboutYearsExperience" TEXT NOT NULL DEFAULT '3+ years',
    "businessHours" TEXT NOT NULL DEFAULT '{"mon":{"open":"09:00","close":"17:00","closed":false},"tue":{"open":"09:00","close":"17:00","closed":false},"wed":{"open":"09:00","close":"17:00","closed":false},"thu":{"open":"09:00","close":"17:00","closed":false},"fri":{"open":"09:00","close":"17:00","closed":false},"sat":{"open":"09:00","close":"14:00","closed":false},"sun":{"open":"","close":"","closed":true}}',
    "depositPercentage" INTEGER NOT NULL DEFAULT 50,
    "lateCancellationHours" INTEGER NOT NULL DEFAULT 24,
    "lateCancellationFeePercentage" INTEGER NOT NULL DEFAULT 50,
    "cancellationFeeMode" TEXT NOT NULL DEFAULT 'FORFEIT_SATISFIES',
    "cancellationPolicyText" TEXT NOT NULL DEFAULT 'Cancellations must be made at least 24 hours before the scheduled appointment.

Cancellations made within 24 hours of the appointment may result in the client being liable for 50% of the appointment total before another appointment can be scheduled.

For example, if the previous appointment total was R100, a cancellation fee of R50 may need to be paid before a new appointment can be booked.

Applicable cancellation fees must be paid by EFT.

Failure to arrive for a scheduled appointment is treated as a cancellation or no-show.

Where a 50% booking deposit has already been paid, a cancellation within 24 hours of the appointment will result in the deposit being forfeited.',
    "policyVersion" TEXT NOT NULL DEFAULT '2026-08-20',
    "eftDetails" TEXT NOT NULL DEFAULT 'Bank: FNB
Account Name: Nailed It Jess
Account Number: 00000000
Branch Code: 250655
Reference: Your booking reference',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "pricingType" TEXT NOT NULL,
    "priceFixed" REAL,
    "priceMin" REAL,
    "priceMax" REAL,
    "pricePerNail" REAL,
    "priceFullSet" REAL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "depositOverridePercentage" INTEGER,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "restricted" BOOLEAN NOT NULL DEFAULT false,
    "restrictionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "requestedDate" TEXT NOT NULL,
    "requestedTime" TEXT NOT NULL,
    "proposedDate" TEXT,
    "proposedTime" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "depositStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "depositMethod" TEXT,
    "depositRecordedAt" DATETIME,
    "nailArtCount" INTEGER,
    "serviceSubtotal" REAL NOT NULL,
    "addOnsTotal" REAL NOT NULL DEFAULT 0,
    "estimatedTotal" REAL NOT NULL,
    "depositAmount" REAL NOT NULL,
    "remainingBalance" REAL NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "designNotes" TEXT NOT NULL DEFAULT '',
    "inspirationImageUrl" TEXT,
    "cancellationFeeStatus" TEXT NOT NULL DEFAULT 'NONE',
    "cancellationFeeAmount" REAL,
    "cancellationReason" TEXT,
    "adminNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookingAddOn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "nailCount" INTEGER,
    "calculatedPrice" REAL NOT NULL,
    CONSTRAINT "BookingAddOn_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookingAddOn_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PolicyAcceptance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "consentText" TEXT NOT NULL,
    "acceptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PolicyAcceptance_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PolicyAcceptance_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Jess',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bookingId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_phone_idx" ON "Client"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_requestedDate_idx" ON "Booking"("requestedDate");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyAcceptance_bookingId_key" ON "PolicyAcceptance"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
