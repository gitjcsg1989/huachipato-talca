import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { GenerarMesButton } from "@/components/dashboard/GenerarMesButton";
import {
  MensualidadGrid,
  type CeldaPlano,
} from "@/components/dashboard/MensualidadGrid";
import { MensualidadCategoriaFiltro } from "@/components/dashboard/MensualidadCategoriaFiltro";
import { getGridMensualidades } from "@/lib/data/mensualidades";
import { getTodasCategorias } from "@/lib/data/categorias";

export default async function MensualidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; categoria?: string }>;
}) {
  const profile = await requireProfile();
  const sp = await searchParams;
  const anio = Number(sp.anio) || new Date().getFullYear();

  const [{ jugadores, celdas }, categorias] = await Promise.all([
    getGridMensualidades(anio, sp.categoria || undefined),
    getTodasCategorias(),
  ]);

  // Serializar el Map a record plano para el client component
  const celdasPlano: Record<string, CeldaPlano> = {};
  for (const [k, v] of celdas) {
    celdasPlano[k] = { estado: v.estado, monto: v.monto };
  }

  return (
    <>
      <Topbar titulo="Mensualidades" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <MensualidadCategoriaFiltro categorias={categorias} />
          <GenerarMesButton anio={anio} />
        </div>

        <MensualidadGrid
          jugadores={jugadores}
          celdas={celdasPlano}
          anio={anio}
        />
      </div>
    </>
  );
}
