import { ServicesManager } from "@/components/admin/ServicesManager";

export const dynamic = "force-dynamic";

export default function AdminServicesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-black mb-1">Services &amp; Price List</h1>
      <p className="text-sm text-medium-grey mb-8">Manage services, pricing, durations, deposits, and availability.</p>
      <ServicesManager />
    </div>
  );
}
