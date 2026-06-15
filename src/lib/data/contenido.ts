import { createPublicClient, supabaseConfigurado } from "@/lib/supabase/server";
import { toCamel } from "@/lib/utils";
import type {
  Noticia,
  Producto,
  GaleriaFoto,
  MiembroTecnico,
} from "@/lib/db/schema";

// ── Noticias ──
export async function getNoticias(
  escuelaId: string | null,
  opts: { pagina?: number; porPagina?: number; soloPublicadas?: boolean } = {},
): Promise<{ noticias: Noticia[]; total: number }> {
  const { pagina = 1, porPagina = 9, soloPublicadas = false } = opts;
  if (!supabaseConfigurado || !escuelaId) return { noticias: [], total: 0 };
  const supabase = createPublicClient();
  let query = supabase
    .from("noticias")
    .select("*", { count: "exact" })
    .eq("escuela_id", escuelaId)
    .order("fecha", { ascending: false });
  if (soloPublicadas) query = query.eq("publicada", true);
  const desde = (pagina - 1) * porPagina;
  query = query.range(desde, desde + porPagina - 1);
  const { data, count } = await query;
  return { noticias: toCamel<Noticia[]>(data ?? []), total: count ?? 0 };
}

export async function getNoticiasRecientes(
  escuelaId: string | null,
  limite = 3,
): Promise<Noticia[]> {
  if (!supabaseConfigurado || !escuelaId) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("noticias")
    .select("*")
    .eq("escuela_id", escuelaId)
    .eq("publicada", true)
    .order("fecha", { ascending: false })
    .limit(limite);
  return toCamel<Noticia[]>(data ?? []);
}

export async function getNoticiaPorSlug(
  escuelaId: string | null,
  slug: string,
): Promise<Noticia | null> {
  if (!supabaseConfigurado || !escuelaId) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("noticias")
    .select("*")
    .eq("escuela_id", escuelaId)
    .eq("slug", slug)
    .maybeSingle();
  return data ? toCamel<Noticia>(data) : null;
}

// ── Galería ──
export async function getGaleria(escuelaId: string | null): Promise<GaleriaFoto[]> {
  if (!supabaseConfigurado || !escuelaId) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("galeria_fotos")
    .select("*")
    .eq("escuela_id", escuelaId)
    .order("orden", { ascending: true })
    .order("fecha", { ascending: false });
  return toCamel<GaleriaFoto[]>(data ?? []);
}

// ── Productos ──
export async function getProductos(escuelaId: string | null): Promise<Producto[]> {
  if (!supabaseConfigurado || !escuelaId) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("productos")
    .select("*")
    .eq("escuela_id", escuelaId)
    .order("created_at", { ascending: false });
  return toCamel<Producto[]>(data ?? []);
}

export async function getProductosDisponibles(
  escuelaId: string | null,
): Promise<Producto[]> {
  return (await getProductos(escuelaId)).filter((p) => p.disponible);
}

export async function getProductosDestacados(
  escuelaId: string | null,
  limite = 4,
): Promise<Producto[]> {
  if (!supabaseConfigurado || !escuelaId) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("productos")
    .select("*")
    .eq("escuela_id", escuelaId)
    .eq("disponible", true)
    .eq("destacado", true)
    .limit(limite);
  return toCamel<Producto[]>(data ?? []);
}

// ── Cuerpo técnico ──
export async function getCuerpoTecnico(
  escuelaId: string | null,
): Promise<MiembroTecnico[]> {
  if (!supabaseConfigurado || !escuelaId) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("cuerpo_tecnico")
    .select("*")
    .eq("escuela_id", escuelaId)
    .order("orden", { ascending: true });
  return toCamel<MiembroTecnico[]>(data ?? []);
}
