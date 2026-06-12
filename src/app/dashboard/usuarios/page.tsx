import { requireRole } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { UsuariosPanel } from "@/components/dashboard/UsuariosPanel";
import { getUsuarios } from "@/lib/data/usuarios";

export default async function UsuariosPage() {
  // Solo superadmin — redirige a /dashboard si no alcanza.
  const profile = await requireRole("superadmin");
  const usuarios = await getUsuarios();

  return (
    <>
      <Topbar titulo="Usuarios" esSuperadmin />
      <div className="p-4 lg:p-8">
        <p className="mb-4 text-sm text-gray-500">
          Gestiona los usuarios internos del panel. Solo el superadmin tiene
          acceso a esta sección.
        </p>
        <UsuariosPanel usuarios={usuarios} miId={profile.id} />
      </div>
    </>
  );
}
