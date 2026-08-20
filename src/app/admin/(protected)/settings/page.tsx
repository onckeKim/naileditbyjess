import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-black mb-1">Settings</h1>
      <p className="text-sm text-medium-grey mb-8">Manage business content, hours, deposit and cancellation policies.</p>
      <SettingsForm
        initial={{
          businessName: settings.businessName,
          established: settings.established,
          whatsapp: settings.whatsapp,
          instagram: settings.instagram,
          contactEmail: settings.contactEmail,
          address: settings.address,
          logoUrl: settings.logoUrl,
          heroHeading: settings.heroHeading,
          heroSubtext: settings.heroSubtext,
          heroImageUrl: settings.heroImageUrl,
          aboutBio: settings.aboutBio,
          aboutQualifications: settings.aboutQualifications,
          aboutLocation: settings.aboutLocation,
          aboutYearsExperience: settings.aboutYearsExperience,
          businessHours: settings.businessHours,
          depositPercentage: settings.depositPercentage,
          lateCancellationHours: settings.lateCancellationHours,
          lateCancellationFeePercentage: settings.lateCancellationFeePercentage,
          cancellationFeeMode: settings.cancellationFeeMode as "FORFEIT_SATISFIES" | "ADDITIONAL_FEE" | "MANUAL_REVIEW",
          cancellationPolicyText: settings.cancellationPolicyText,
          policyVersion: settings.policyVersion,
          eftDetails: settings.eftDetails,
        }}
      />
    </div>
  );
}
