import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { JugadorForm } from "@/components/dashboard/JugadorForm";
import { ToggleEstadoJugador } from "@/components/dashboard/ToggleEstadoJugador";
import { FotoJugador } from "@/components/dashboard/FotoJugador";
import { Badge } from "@/components/ui/badge";
import {
  getJugadorPorId,
  getMensualidadesDeJugador,
} from "@/lib/data/jugadores";
import { getTodasCategorias } from "@/lib/data/categorias";
import { calcularEdad, formatCLP, nombreMes } from "@/lib/utils";

const ETIQUETA_ESTADO: Record<string, { txt: string; cls: string }> = {
  pagado: { txt: "Pagado", cls: "bg-ok/15 text-ok" },
  pendiente: { txt: "Pendiente", cls: "bg-warn/15 text-warn" },
  exento: { txt: "Exento", cls: "bg-brand/15 text-brand" },
};

export default async function FichaJugadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile();
  const { id } = await params;

  const jugador = await getJugadorPorId(id);
  if (!jugador) notFound();

  const anio = new Date().getFullYear();
  const [categorias, mensualidades] = await Promise.all([
    getTodasCategorias(),
    getMensualidadesDeJugador(id, anio),
  ]);

  return (
    <>
      <Topbar
        titulo={`${jugador.nombre} ${jugador.apellido}`}
        esSuperadmin={profile.rol === "superadmin"}
      />
      <div className="p-4 lg:p-8">
        <Link
          href="/dashboard/jugadores"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={15} />
          Volver a jugadores
        </Link>

        {/* Encabezado de perfil con foto */}
        <div className="mb-6 flex flex-col items-center gap-5 rounded-xl border border-black/[0.06] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <FotoJugador
            id={jugador.id}
            fotoUrl={jugador.fotoUrl}
            nombre={`${jugador.nombre} ${jugador.apellido}`}
          />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold text-gray-900">
              {jugador.nombre} {jugador.apellido}
            </h2>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge
                className={
                  jugador.activo
                    ? "bg-ok/15 text-ok hover:bg-ok/15"
                    : "bg-gray-200 text-gray-600"
                }
              >
                {jugador.activo ? "Activo" : "Inactivo"}
              </Badge>
              <Badge variant="secondary">
                {jugador.categorias?.nombre ?? "Sin categoría"}
              </Badge>
              <Badge variant="secondary">
                {calcularEdad(jugador.fechaNacimiento)} años
              </Badge>
            </div>
          </div>
          <ToggleEstadoJugador id={jugador.id} activo={jugador.activo} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Datos editables */}
          <div className="rounded-xl border border-black/[0.06] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Datos del jugador
            </h2>
            <JugadorForm categorias={categorias} jugador={jugador} />
          </div>

          {/* Mensualidades */}
          <div className="rounded-xl border border-black/[0.06] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Mensualidades {anio}
            </h2>
            {mensualidades.length === 0 ? (
              <p className="text-sm text-gray-400">
                No hay mensualidades registradas este año. Genéralas desde la
                sección Mensualidades.
              </p>
            ) : (
              <ul className="space-y-2">
                {mensualidades.map((m) => {
                  const e = ETIQUETA_ESTADO[m.estado];
                  return (
                    <li
                      key={m.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{nombreMes(m.mes)}</span>
                      <span className="flex items-center gap-3">
                        <span className="tabular-nums text-gray-500">
                          {formatCLP(m.monto)}
                        </span>
                        <Badge className={`${e.cls} hover:${e.cls}`}>
                          {e.txt}
                        </Badge>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
