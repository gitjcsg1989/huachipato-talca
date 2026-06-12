import { redirect } from "next/navigation";
import { getProfile, tieneRol } from "@/lib/supabase/server";
import type { Profile, Rol } from "@/lib/db/schema";

/**
 * Garantiza que hay un perfil interno activo. Redirige a /login si no.
 * Usar en layouts/páginas del dashboard y al inicio de Server Actions sensibles.
 */
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || !profile.activo) {
    redirect("/login");
  }
  return profile;
}

/**
 * Garantiza un rol mínimo. Redirige a /dashboard si el rol no alcanza.
 */
export async function requireRole(minimo: Rol): Promise<Profile> {
  const profile = await requireProfile();
  if (!tieneRol(profile, minimo)) {
    redirect("/dashboard");
  }
  return profile;
}

/**
 * Versión para API Routes: devuelve el perfil o null (sin redirect).
 */
export async function checkRole(minimo: Rol): Promise<Profile | null> {
  const profile = await getProfile();
  if (!profile || !tieneRol(profile, minimo)) return null;
  return profile;
}
