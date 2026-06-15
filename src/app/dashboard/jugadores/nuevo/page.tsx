import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { JugadorForm } from "@/components/dashboard/JugadorForm";
import { getTodasCategorias } from "@/lib/data/categorias";
import { getEscuelaActivaId } from "@/lib/data/escuelas";

export default async function NuevoJugadorPage() {
  const profile = await requireProfile();
  const categorias = await getTodasCategorias(await getEscuelaActivaId());

  return (
    <>
      <Topbar titulo="Nuevo jugador" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <Link
          href="/dashboard/jugadores"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={15} />
          Volver a jugadores
        </Link>

        <div className="max-w-2xl rounded-xl border border-black/[0.06] bg-white p-6 shadow-sm">
          <JugadorForm categorias={categorias} />
        </div>
      </div>
    </>
  );
}
