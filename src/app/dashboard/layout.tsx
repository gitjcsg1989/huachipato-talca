import { requireProfile } from "@/lib/auth/guards";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { contarInscripcionesPendientes } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const pendientes = await contarInscripcionesPendientes();
  const esSuperadmin = profile.rol === "superadmin";

  return (
    <div className="flex min-h-screen bg-dash-bg text-gray-900">
      <Sidebar
        nombre={profile.nombre}
        rol={profile.rol}
        esSuperadmin={esSuperadmin}
        inscripcionesPendientes={pendientes}
      />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
