import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { NoticiasAdmin } from "@/components/dashboard/NoticiasAdmin";
import { getNoticias } from "@/lib/data/contenido";
import { getEscuelaActivaId } from "@/lib/data/escuelas";

export default async function NoticiasDashboardPage() {
  const profile = await requireProfile();
  const { noticias } = await getNoticias(await getEscuelaActivaId(), {
    porPagina: 100,
  });

  return (
    <>
      <Topbar titulo="Noticias" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <NoticiasAdmin noticias={noticias} />
      </div>
    </>
  );
}
