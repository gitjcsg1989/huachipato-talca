import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { CuerpoTecnicoAdmin } from "@/components/dashboard/CuerpoTecnicoAdmin";
import { getCuerpoTecnico } from "@/lib/data/contenido";

export default async function CuerpoTecnicoDashboardPage() {
  const profile = await requireProfile();
  const miembros = await getCuerpoTecnico();

  return (
    <>
      <Topbar titulo="Cuerpo técnico" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <CuerpoTecnicoAdmin miembros={miembros} />
      </div>
    </>
  );
}
