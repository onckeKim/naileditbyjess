-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "proposalExpiresAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "proposalMessage" TEXT;

-- CreateTable
CREATE TABLE "BookingStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL DEFAULT 'ADMIN',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingStatusHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookingActionToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingActionToken_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReminderLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessSettings" (
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
    "businessPhone" TEXT NOT NULL DEFAULT '',
    "addressPublic" BOOLEAN NOT NULL DEFAULT false,
    "faq" TEXT NOT NULL DEFAULT '[]',
    "declineReasonTemplates" TEXT NOT NULL DEFAULT '[]',
    "prepareForAppointmentText" TEXT NOT NULL DEFAULT 'Arrive with clean, product-free nails where possible.
Send any inspiration images ahead of your appointment.
Let Jess know about any existing gel, acrylic, or other product that needs removing.
Mention any damaged nails before your appointment begins.
Select a soak-off add-on if existing product needs to be removed first.
Contact the studio via WhatsApp if you''re running late.
Review your selected service, estimated duration, deposit, and cancellation policy before you arrive.',
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minNoticeHours" INTEGER NOT NULL DEFAULT 2,
    "maxAdvanceDays" INTEGER NOT NULL DEFAULT 60,
    "bufferMinutes" INTEGER NOT NULL DEFAULT 0,
    "proposalExpiryHours" INTEGER NOT NULL DEFAULT 48,
    "remindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "remind24hEnabled" BOOLEAN NOT NULL DEFAULT true,
    "remind2hEnabled" BOOLEAN NOT NULL DEFAULT false,
    "remind24hMessage" TEXT NOT NULL DEFAULT 'This is a friendly reminder of your upcoming appointment with Nailed It Jess tomorrow.',
    "remind2hMessage" TEXT NOT NULL DEFAULT 'This is a friendly reminder that your Nailed It Jess appointment is coming up in a couple of hours.',
    "nailRepairsPolicyText" TEXT NOT NULL DEFAULT '',
    "nailRepairsPolicyPublished" BOOLEAN NOT NULL DEFAULT false,
    "guestsChildrenPolicyText" TEXT NOT NULL DEFAULT '',
    "guestsChildrenPolicyPublished" BOOLEAN NOT NULL DEFAULT false,
    "healthAllergyPolicyText" TEXT NOT NULL DEFAULT '',
    "healthAllergyPolicyPublished" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BusinessSettings" ("aboutBio", "aboutLocation", "aboutQualifications", "aboutYearsExperience", "address", "businessHours", "businessName", "cancellationFeeMode", "cancellationPolicyText", "contactEmail", "depositPercentage", "eftDetails", "established", "heroHeading", "heroImageUrl", "heroSubtext", "id", "instagram", "lateCancellationFeePercentage", "lateCancellationHours", "logoUrl", "policyVersion", "updatedAt", "whatsapp") SELECT "aboutBio", "aboutLocation", "aboutQualifications", "aboutYearsExperience", "address", "businessHours", "businessName", "cancellationFeeMode", "cancellationPolicyText", "contactEmail", "depositPercentage", "eftDetails", "established", "heroHeading", "heroImageUrl", "heroSubtext", "id", "instagram", "lateCancellationFeePercentage", "lateCancellationHours", "logoUrl", "policyVersion", "updatedAt", "whatsapp" FROM "BusinessSettings";
DROP TABLE "BusinessSettings";
ALTER TABLE "new_BusinessSettings" RENAME TO "BusinessSettings";
CREATE TABLE "new_EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "bookingId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'LOGGED_ONLY',
    "providerMessageId" TEXT,
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_EmailLog" ("body", "bookingId", "createdAt", "id", "status", "subject", "to") SELECT "body", "bookingId", "createdAt", "id", "status", "subject", "to" FROM "EmailLog";
DROP TABLE "EmailLog";
ALTER TABLE "new_EmailLog" RENAME TO "EmailLog";
CREATE INDEX "EmailLog_bookingId_idx" ON "EmailLog"("bookingId");
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceId" TEXT,
    CONSTRAINT "Review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("approved", "clientName", "createdAt", "featured", "id", "rating", "text") SELECT "approved", "clientName", "createdAt", "featured", "id", "rating", "text" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "BookingStatusHistory_bookingId_idx" ON "BookingStatusHistory"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingActionToken_tokenHash_key" ON "BookingActionToken"("tokenHash");

-- CreateIndex
CREATE INDEX "BookingActionToken_bookingId_idx" ON "BookingActionToken"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "ReminderLog_bookingId_type_key" ON "ReminderLog"("bookingId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDate_date_key" ON "BlockedDate"("date");
