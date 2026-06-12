import { createPublicClient, supabaseConfigurado } from "@/lib/supabase/server";
import { toCamel } from "@/lib/utils";
import type {
  Noticia,
  Producto,
  GaleriaFoto,
  Ajustes,
  MiembroTecnico,
} from "@/lib/db/schema";

// ── Noticias ──
export async function getNoticias(opts: {
  pagina?: number;
  porPagina?: number;
  soloPublicadas?: boolean;
} = {}): Promise<{ noticias: Noticia[]; total: number }> {
  const { pagina = 1, porPagina = 9, soloPublicadas = false } = opts;
  if (!supabaseConfigurado) return { noticias: [], total: 0 };
  const supabase = createPublicClient();
  let query = supabase
    .from("noticias")
    .select("*", { count: "exact" })
    .order("fecha", { ascending: false });
  if (soloPublicadas) query = query.eq("publicada", true);
  const desde = (pagina - 1) * porPagina;
  query = query.range(desde, desde + porPagina - 1);
  const { data, count } = await query;
  return { noticias: toCamel<Noticia[]>(data ?? []), total: count ?? 0 };
}

export async function getNoticiasRecientes(limite = 3): Promise<Noticia[]> {
  if (!supabaseConfigurado) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("noticias")
    .select("*")
    .eq("publicada", true)
    .order("fecha", { ascending: false })
    .limit(limite);
  return toCamel<Noticia[]>(data ?? []);
}

export async function getNoticiaPorSlug(slug: string): Promise<Noticia | null> {
  if (!supabaseConfigurado) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("noticias")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ? toCamel<Noticia>(data) : null;
}

// ── Galería ──
export async function getGaleria(): Promise<GaleriaFoto[]> {
  if (!supabaseConfigurado) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("galeria_fotos")
    .select("*")
    .order("orden", { ascending: true })
    .order("fecha", { ascending: false });
  return toCamel<GaleriaFoto[]>(data ?? []);
}

// ── Productos ──
export async function getProductos(): Promise<Producto[]> {
  if (!supabaseConfigurado) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });
  return toCamel<Producto[]>(data ?? []);
}

export async function getProductosDisponibles(): Promise<Producto[]> {
  return (await getProductos()).filter((p) => p.disponible);
}

export async function getProductosDestacados(limite = 4): Promise<Producto[]> {
  if (!supabaseConfigurado) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("productos")
    .select("*")
    .eq("disponible", true)
    .eq("destacado", true)
    .limit(limite);
  return toCamel<Producto[]>(data ?? []);
}

// ── Cuerpo técnico ──
export async function getCuerpoTecnico(): Promise<MiembroTecnico[]> {
  if (!supabaseConfigurado) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("cuerpo_tecnico")
    .select("*")
    .order("orden", { ascending: true });
  return toCamel<MiembroTecnico[]>(data ?? []);
}

// ── Ajustes del sitio ──
export async function getAjustesSitio(): Promise<Ajustes | null> {
  if (!supabaseConfigurado) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("ajustes")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return data ? toCamel<Ajustes>(data) : null;
}
