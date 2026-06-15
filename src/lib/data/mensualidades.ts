import { createClient } from "@/lib/supabase/server";
import { toCamel } from "@/lib/utils";
import type { Mensualidad } from "@/lib/db/schema";

export interface JugadorGrid {
  id: string;
  nombre: string;
  apellido: string;
  categoriaNombre: string | null;
}

export interface GridMensualidades {
  jugadores: JugadorGrid[];
  /** clave `${jugadorId}-${mes}` → mensualidad */
  celdas: Map<string, Mensualidad>;
}

export async function getGridMensualidades(
  escuelaId: string | null,
  anio: number,
  categoriaId?: string,
): Promise<GridMensualidades> {
  if (!escuelaId) return { jugadores: [], celdas: new Map() };
  const supabase = await createClient();

  let qJug = supabase
    .from("jugadores")
    .select("id, nombre, apellido, categorias(nombre)")
    .eq("escuela_id", escuelaId)
    .eq("activo", true)
    .order("apellido", { ascending: true });
  if (categoriaId) qJug = qJug.eq("categoria_id", categoriaId);

  const { data: jugRaw } = await qJug;
  const jugadores: JugadorGrid[] = (
    (jugRaw as
      | { id: string; nombre: string; apellido: string; categorias: { nombre: string } | null }[]
      | null) ?? []
  ).map((j) => ({
    id: j.id,
    nombre: j.nombre,
    apellido: j.apellido,
    categoriaNombre: j.categorias?.nombre ?? null,
  }));

  const ids = jugadores.map((j) => j.id);
  const celdas = new Map<string, Mensualidad>();

  if (ids.length > 0) {
    const { data: mens } = await supabase
      .from("mensualidades")
      .select("*")
      .eq("anio", anio)
      .in("jugador_id", ids);
    for (const m of toCamel<Mensualidad[]>(mens ?? [])) {
      celdas.set(`${m.jugadorId}-${m.mes}`, m);
    }
  }

  return { jugadores, celdas };
}
