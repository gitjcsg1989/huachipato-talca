import Link from "next/link";
import { Plus } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { JugadoresFilters } from "@/components/dashboard/JugadoresFilters";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getJugadores } from "@/lib/data/jugadores";
import { getTodasCategorias } from "@/lib/data/categorias";
import { getEscuelaActivaId } from "@/lib/data/escuelas";

export default async function JugadoresPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    estado?: string;
    busqueda?: string;
    pagina?: string;
  }>;
}) {
  const profile = await requireProfile();
  const sp = await searchParams;
  const pagina = Math.max(1, Number(sp.pagina) || 1);
  const escuelaId = await getEscuelaActivaId();

  const [{ jugadores, total, porPagina }, categorias] = await Promise.all([
    getJugadores({
      escuelaId,
      categoriaId: sp.categoria || undefined,
      activo:
        sp.estado === "activo"
          ? true
          : sp.estado === "inactivo"
            ? false
            : undefined,
      busqueda: sp.busqueda || undefined,
      pagina,
    }),
    getTodasCategorias(escuelaId),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

  return (
    <>
      <Topbar titulo="Jugadores" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">{total} jugadores</p>
          <Link
            href="/dashboard/jugadores/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
          >
            <Plus size={16} />
            Nuevo jugador
          </Link>
        </div>

        <JugadoresFilters categorias={categorias} />

        <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Apoderado</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jugadores.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-gray-400"
                  >
                    No hay jugadores que coincidan.
                  </TableCell>
                </TableRow>
              ) : (
                jugadores.map((j) => (
                  <TableRow key={j.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/jugadores/${j.id}`}
                        className="hover:text-brand"
                      >
                        {j.nombre} {j.apellido}
                      </Link>
                    </TableCell>
                    <TableCell>{j.categorias?.nombre ?? "—"}</TableCell>
                    <TableCell>{j.nombreApoderado}</TableCell>
                    <TableCell>{j.telefonoApoderado}</TableCell>
                    <TableCell>
                      {j.activo ? (
                        <Badge className="bg-ok/15 text-ok hover:bg-ok/15">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPaginas > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => {
              const next = new URLSearchParams();
              if (sp.categoria) next.set("categoria", sp.categoria);
              if (sp.estado) next.set("estado", sp.estado);
              if (sp.busqueda) next.set("busqueda", sp.busqueda);
              if (n > 1) next.set("pagina", String(n));
              return (
                <Link
                  key={n}
                  href={`/dashboard/jugadores?${next.toString()}`}
                  className={
                    n === pagina
                      ? "rounded-lg bg-brand px-3.5 py-1.5 text-sm font-semibold text-white"
                      : "rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-600"
                  }
                >
                  {n}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
