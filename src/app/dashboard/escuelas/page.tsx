import { requireRole } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { EscuelasAdmin } from "@/components/dashboard/EscuelasAdmin";
import { getEscuelas, getEscuelaActivaId } from "@/lib/data/escuelas";

export default async function EscuelasDashboardPage() {
  await requireRole("superadmin");
  const [escuelas, activaId] = await Promise.all([
    getEscuelas(),
    getEscuelaActivaId(),
  ]);

  return (
    <>
      <Topbar titulo="Escuelas" esSuperadmin />
      <div className="p-4 lg:p-8">
        <p className="mb-4 text-sm text-gray-500">
          Crea y configura escuelas (logo, colores, contacto). Cada una parte con
          datos de ejemplo y su propio administrador. Usa “Gestionar” para
          administrar el contenido de una escuela.
        </p>
        <EscuelasAdmin escuelas={escuelas} activaId={activaId} />
      </div>
    </>
  );
}
