import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Profile, Rol } from "@/lib/db/schema";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 * Lee y refresca cookies de sesión.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component: el middleware refresca la sesión.
          }
        },
      },
    },
  );
}

/** ¿Está Supabase configurado? Evita romper el build sin credenciales. */
export const supabaseConfigurado = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

/**
 * Cliente anónimo SIN cookies — para lecturas públicas (RLS permite SELECT
 * a anon). No fuerza render dinámico, así las páginas pueden usar ISR.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Cliente con service role — BYPASEA RLS. Usar SOLO en el servidor para
 * operaciones administrativas (crear usuarios, etc.). Nunca exponer al cliente.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/** Usuario autenticado (o null). Cacheado por request. */
export const getUser = cache(async () => {
  if (!supabaseConfigurado) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Perfil interno del usuario autenticado (o null). Cacheado por request. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (data as Profile | null) ?? null;
});

const RANGO: Record<Rol, number> = { admin: 1, superadmin: 2 };

/** ¿El perfil tiene al menos el rol indicado? */
export function tieneRol(profile: Profile | null, minimo: Rol): boolean {
  if (!profile || !profile.activo) return false;
  return RANGO[profile.rol] >= RANGO[minimo];
}
