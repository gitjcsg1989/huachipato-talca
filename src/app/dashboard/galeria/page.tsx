import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { GaleriaAdmin } from "@/components/dashboard/GaleriaAdmin";
import { getGaleria } from "@/lib/data/contenido";
import { getEscuelaActivaId } from "@/lib/data/escuelas";

export default async function GaleriaDashboardPage() {
  const profile = await requireProfile();
  const fotos = await getGaleria(await getEscuelaActivaId());

  return (
    <>
      <Topbar titulo="Galería" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <GaleriaAdmin fotos={fotos} />
      </div>
    </>
  );
}
