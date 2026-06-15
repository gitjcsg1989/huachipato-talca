import { createClient } from "@/lib/supabase/server";
import { toCamel } from "@/lib/utils";
import type { Jugador, Categoria, Mensualidad } from "@/lib/db/schema";

export interface JugadorRow extends Jugador {
  categorias: Pick<Categoria, "id" | "nombre" | "slug"> | null;
}

export interface FiltrosJugadores {
  escuelaId: string | null;
  categoriaId?: string;
  activo?: boolean;
  busqueda?: string;
  pagina?: number;
  porPagina?: number;
}

export async function getJugadores(filtros: FiltrosJugadores) {
  const { escuelaId, categoriaId, activo, busqueda, pagina = 1, porPagina = 20 } =
    filtros;
  if (!escuelaId) return { jugadores: [], total: 0, pagina, porPagina };
  const supabase = await createClient();

  let query = supabase
    .from("jugadores")
    .select("*, categorias(id, nombre, slug)", { count: "exact" })
    .eq("escuela_id", escuelaId);

  if (categoriaId) query = query.eq("categoria_id", categoriaId);
  if (typeof activo === "boolean") query = query.eq("activo", activo);
  if (busqueda) {
    query = query.or(
      `nombre.ilike.%${busqueda}%,apellido.ilike.%${busqueda}%`,
    );
  }

  const desde = (pagina - 1) * porPagina;
  query = query
    .order("apellido", { ascending: true })
    .range(desde, desde + porPagina - 1);

  const { data, count } = await query;
  return {
    jugadores: toCamel<JugadorRow[]>(data ?? []),
    total: count ?? 0,
    pagina,
    porPagina,
  };
}

export async function getJugadorPorId(id: string): Promise<JugadorRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jugadores")
    .select("*, categorias(id, nombre, slug)")
    .eq("id", id)
    .maybeSingle();
  return data ? toCamel<JugadorRow>(data) : null;
}

export async function getMensualidadesDeJugador(
  jugadorId: string,
  anio: number,
): Promise<Mensualidad[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mensualidades")
    .select("*")
    .eq("jugador_id", jugadorId)
    .eq("anio", anio)
    .order("mes", { ascending: true });
  return toCamel<Mensualidad[]>(data ?? []);
}
