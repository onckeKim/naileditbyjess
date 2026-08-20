import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-black mb-1">Settings</h1>
      <p className="text-sm text-medium-grey mb-8">Manage business content, hours, availability, deposit and cancellation policies.</p>
      <SettingsForm
        initial={{
          ...settings,
          cancellationFeeMode: settings.cancellationFeeMode as "FORFEIT_SATISFIES" | "ADDITIONAL_FEE" | "MANUAL_REVIEW",
        }}
      />
    </div>
  );
}
