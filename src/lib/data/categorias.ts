import { createPublicClient, supabaseConfigurado } from "@/lib/supabase/server";
import { toCamel } from "@/lib/utils";
import type { Categoria, Jugador } from "@/lib/db/schema";

/** Categorías activas, ordenadas por año (las más grandes primero). */
export async function getCategoriasActivas(): Promise<Categoria[]> {
  if (!supabaseConfigurado) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categorias")
    .select("*")
    .eq("activa", true)
    .order("anio_min", { ascending: false });
  return toCamel<Categoria[]>(data ?? []);
}

export async function getTodasCategorias(): Promise<Categoria[]> {
  if (!supabaseConfigurado) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categorias")
    .select("*")
    .order("anio_min", { ascending: false });
  return toCamel<Categoria[]>(data ?? []);
}

export async function getCategoriaPorSlug(
  slug: string,
): Promise<Categoria | null> {
  if (!supabaseConfigurado) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categorias")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ? toCamel<Categoria>(data) : null;
}

export type JugadorPublico = Pick<
  Jugador,
  "id" | "nombre" | "apellido" | "fotoUrl" | "fechaNacimiento"
>;

/** Jugadores activos de una categoría — datos básicos para el plantel público. */
export async function getJugadoresPublicosDeCategoria(
  categoriaId: string,
): Promise<JugadorPublico[]> {
  if (!supabaseConfigurado) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("jugadores")
    .select("id, nombre, apellido, foto_url, fecha_nacimiento")
    .eq("categoria_id", categoriaId)
    .eq("activo", true)
    .order("apellido", { ascending: true });
  return toCamel<JugadorPublico[]>(data ?? []);
}
