import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg">
      <AdminNav adminName={admin.name} />
      <main className="flex-1 min-w-0 p-4 md:p-10">{children}</main>
    </div>
  );
}
