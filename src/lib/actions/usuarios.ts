"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRole } from "@/lib/auth/guards";
import { usuarioSchema } from "@/lib/validators";
import type { Rol } from "@/lib/db/schema";

export type ActionResult = { ok: boolean; error?: string };

function fd(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function crearUsuario(formData: FormData): Promise<ActionResult> {
  const profile = await checkRole("superadmin");
  if (!profile) return { ok: false, error: "Solo el superadmin puede crear usuarios" };

  const parsed = usuarioSchema.safeParse({
    nombre: fd(formData, "nombre"),
    email: fd(formData, "email"),
    password: fd(formData, "password"),
    rol: fd(formData, "rol"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  const d = parsed.data;

  const admin = createAdminClient();

  // 1. Crear usuario en auth
  const { data: created, error: errAuth } = await admin.auth.admin.createUser({
    email: d.email,
    password: d.password,
    email_confirm: true,
  });

  if (errAuth || !created.user) {
    console.error("Error creando usuario auth:", errAuth);
    return { ok: false, error: errAuth?.message ?? "No se pudo crear el usuario" };
  }

  // 2. Crear perfil
  const { error: errProfile } = await admin.from("profiles").insert({
    id: created.user.id,
    nombre: d.nombre,
    email: d.email,
    rol: d.rol,
    activo: true,
  });

  if (errProfile) {
    console.error("Error creando perfil:", errProfile);
    // rollback del usuario auth
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: "No se pudo crear el perfil" };
  }

  revalidatePath("/dashboard/usuarios");
  return { ok: true };
}

export async function cambiarRolUsuario(
  id: string,
  rol: Rol,
): Promise<ActionResult> {
  const profile = await checkRole("superadmin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ rol }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo cambiar el rol" };

  revalidatePath("/dashboard/usuarios");
  return { ok: true };
}

export async function cambiarEstadoUsuario(
  id: string,
  activo: boolean,
): Promise<ActionResult> {
  const profile = await checkRole("superadmin");
  if (!profile) return { ok: false, error: "No autorizado" };
  if (id === profile.id)
    return { ok: false, error: "No puedes desactivarte a ti mismo" };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ activo }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo cambiar el estado" };

  revalidatePath("/dashboard/usuarios");
  return { ok: true };
}
