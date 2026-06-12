"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRole } from "@/lib/auth/guards";
import { jugadorSchema } from "@/lib/validators";

export type ActionResult = { ok: boolean; error?: string; id?: string };

function fd(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function crearJugador(formData: FormData): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const parsed = jugadorSchema.safeParse({
    nombre: fd(formData, "nombre"),
    apellido: fd(formData, "apellido"),
    rut: fd(formData, "rut"),
    fecha_nacimiento: fd(formData, "fecha_nacimiento"),
    categoria_id: fd(formData, "categoria_id"),
    nombre_apoderado: fd(formData, "nombre_apoderado"),
    parentesco_apoderado: fd(formData, "parentesco_apoderado"),
    telefono_apoderado: fd(formData, "telefono_apoderado"),
    email_apoderado: fd(formData, "email_apoderado"),
    notas: fd(formData, "notas"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  const d = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jugadores")
    .insert({
      nombre: d.nombre,
      apellido: d.apellido,
      rut: d.rut || null,
      fecha_nacimiento: d.fecha_nacimiento,
      categoria_id: d.categoria_id,
      nombre_apoderado: d.nombre_apoderado,
      parentesco_apoderado: d.parentesco_apoderado || null,
      telefono_apoderado: d.telefono_apoderado,
      email_apoderado: d.email_apoderado || null,
      notas: d.notas || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creando jugador:", error);
    return { ok: false, error: "No se pudo crear el jugador" };
  }

  revalidatePath("/dashboard/jugadores");
  return { ok: true, id: data.id };
}

export async function actualizarJugador(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const parsed = jugadorSchema.safeParse({
    nombre: fd(formData, "nombre"),
    apellido: fd(formData, "apellido"),
    rut: fd(formData, "rut"),
    fecha_nacimiento: fd(formData, "fecha_nacimiento"),
    categoria_id: fd(formData, "categoria_id"),
    nombre_apoderado: fd(formData, "nombre_apoderado"),
    parentesco_apoderado: fd(formData, "parentesco_apoderado"),
    telefono_apoderado: fd(formData, "telefono_apoderado"),
    email_apoderado: fd(formData, "email_apoderado"),
    notas: fd(formData, "notas"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  const d = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("jugadores")
    .update({
      nombre: d.nombre,
      apellido: d.apellido,
      rut: d.rut || null,
      fecha_nacimiento: d.fecha_nacimiento,
      categoria_id: d.categoria_id,
      nombre_apoderado: d.nombre_apoderado,
      parentesco_apoderado: d.parentesco_apoderado || null,
      telefono_apoderado: d.telefono_apoderado,
      email_apoderado: d.email_apoderado || null,
      notas: d.notas || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error actualizando jugador:", error);
    return { ok: false, error: "No se pudo actualizar" };
  }

  revalidatePath(`/dashboard/jugadores/${id}`);
  revalidatePath("/dashboard/jugadores");
  return { ok: true, id };
}

export async function cambiarEstadoJugador(
  id: string,
  activo: boolean,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("jugadores")
    .update({ activo })
    .eq("id", id);

  if (error) return { ok: false, error: "No se pudo cambiar el estado" };

  revalidatePath(`/dashboard/jugadores/${id}`);
  revalidatePath("/dashboard/jugadores");
  return { ok: true, id };
}
