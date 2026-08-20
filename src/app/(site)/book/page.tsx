import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Book an Appointment — Nailed It Jess" };
export const dynamic = "force-dynamic";

export default async function BookPage() {
  const [settings, services, blockedDates] = await Promise.all([
    getSettings(),
    prisma.service.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
    prisma.blockedDate.findMany({ select: { date: true } }),
  ]);

  const primaryServices = services.filter((s) => s.category === "PRIMARY");
  const addOnServices = services.filter((s) => s.category === "ART_ADDON");

  return (
    <section className="bg-marble border-b border-marble py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 md:px-8 text-center flex flex-col items-center gap-3 mb-10">
        <span className="text-xs tracking-[0.3em] uppercase text-medium-grey">Request an Appointment</span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-black">Book Your Appointment</h1>
        <p className="text-medium-grey max-w-xl">
          Submitting this form sends a request to Nailed It Jess — your appointment is only confirmed once accepted.
        </p>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-8">
        {settings.bookingEnabled ? (
          <BookingWizard
            primaryServices={primaryServices}
            addOnServices={addOnServices}
            depositPercentage={settings.depositPercentage}
            policyVersion={settings.policyVersion}
            businessHours={settings.businessHours}
            blockedDates={blockedDates.map((b) => b.date)}
            minNoticeHours={settings.minNoticeHours}
            maxAdvanceDays={settings.maxAdvanceDays}
          />
        ) : (
          <Card className="p-10 text-center">
            <h2 className="font-display text-2xl font-semibold text-black mb-3">Online Booking Coming Soon</h2>
            <p className="text-medium-grey mb-6 max-w-md mx-auto">
              We're putting the finishing touches on online booking. In the meantime, please reach out via WhatsApp to arrange your appointment.
            </p>
            <div className="flex justify-center">
              <WhatsAppButton whatsapp={settings.whatsapp} message="Hi Jess! I'd like to book an appointment." />
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
