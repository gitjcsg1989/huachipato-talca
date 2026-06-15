import { cookies } from "next/headers";
import { cache } from "react";
import { createPublicClient, supabaseConfigurado, getProfile } from "@/lib/supabase/server";
import { toCamel } from "@/lib/utils";
import type { Escuela } from "@/lib/db/schema";

export const COOKIE_ESCUELA = "escuela_activa";

/** Todas las escuelas (para la plataforma / selector). */
export async function getEscuelas(): Promise<Escuela[]> {
  if (!supabaseConfigurado) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("escuelas")
    .select("*")
    .order("created_at", { ascending: true });
  return toCamel<Escuela[]>(data ?? []);
}

export const getEscuelaPorSlug = cache(
  async (slug: string): Promise<Escuela | null> => {
    if (!supabaseConfigurado) return null;
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("escuelas")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ? toCamel<Escuela>(data) : null;
  },
);

export async function getEscuelaPorId(id: string): Promise<Escuela | null> {
  if (!supabaseConfigurado) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("escuelas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? toCamel<Escuela>(data) : null;
}

/**
 * Escuela activa en el panel:
 * - admin → su escuela (profiles.escuela_id)
 * - superadmin → la seleccionada (cookie) o la suya por defecto
 * Devuelve el id, o null si no hay sesión/escuela.
 */
export const getEscuelaActivaId = cache(async (): Promise<string | null> => {
  const profile = await getProfile();
  if (!profile) return null;
  if (profile.rol === "superadmin") {
    const cookieStore = await cookies();
    const sel = cookieStore.get(COOKIE_ESCUELA)?.value;
    if (sel) return sel;
  }
  return profile.escuelaId ?? null;
});

export async function getEscuelaActiva(): Promise<Escuela | null> {
  const id = await getEscuelaActivaId();
  return id ? getEscuelaPorId(id) : null;
}
