import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { AjustesForm } from "@/components/dashboard/AjustesForm";
import { getAjustesSitio } from "@/lib/data/contenido";

export default async function AjustesDashboardPage() {
  const profile = await requireProfile();
  const ajustes = await getAjustesSitio();

  return (
    <>
      <Topbar titulo="Ajustes del sitio" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <p className="mb-4 text-sm text-gray-500">
          Textos del inicio, datos de contacto, redes sociales y datos de
          transferencia para la tienda.
        </p>
        <AjustesForm ajustes={ajustes} />
      </div>
    </>
  );
}
