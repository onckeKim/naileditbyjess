import { ClientsManager } from "@/components/admin/ClientsManager";

export const dynamic = "force-dynamic";

export default function AdminClientsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-black mb-1">Clients</h1>
      <p className="text-sm text-medium-grey mb-8">View clients and manage booking restrictions.</p>
      <ClientsManager />
    </div>
  );
}
