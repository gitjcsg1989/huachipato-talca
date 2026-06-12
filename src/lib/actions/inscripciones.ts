"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRole } from "@/lib/auth/guards";
import { enviarEmailBienvenida } from "@/lib/email";
import { toCamel } from "@/lib/utils";
import type { Inscripcion } from "@/lib/db/schema";

export type ActionResult = { ok: boolean; error?: string; jugadorId?: string };

/**
 * Aprueba una inscripción: crea el jugador, marca la inscripción como aprobada
 * y envía email de bienvenida. Requiere la categoría destino.
 */
export async function aprobarInscripcion(
  inscripcionId: string,
  categoriaId: string,
  apellido: string,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };
  if (!categoriaId) return { ok: false, error: "Selecciona una categoría" };

  const supabase = await createClient();

  const { data: insc } = await supabase
    .from("inscripciones")
    .select("*")
    .eq("id", inscripcionId)
    .maybeSingle();

  if (!insc) return { ok: false, error: "Inscripción no encontrada" };
  const inscripcion = toCamel<Inscripcion>(insc);
  if (inscripcion.estado === "aprobada") {
    return { ok: false, error: "Esta inscripción ya fue aprobada" };
  }

  // Crear jugador
  const { data: jugador, error: errJugador } = await supabase
    .from("jugadores")
    .insert({
      nombre: inscripcion.nombreNino,
      apellido: apellido || "—",
      fecha_nacimiento: inscripcion.fechaNacimiento,
      categoria_id: categoriaId,
      nombre_apoderado: inscripcion.nombreApoderado,
      parentesco_apoderado: inscripcion.parentescoApoderado,
      telefono_apoderado: inscripcion.telefono,
      email_apoderado: inscripcion.email,
    })
    .select("id")
    .single();

  if (errJugador) {
    console.error("Error creando jugador desde inscripción:", errJugador);
    return { ok: false, error: "No se pudo crear el jugador" };
  }

  // Marcar inscripción aprobada
  const { error: errUpd } = await supabase
    .from("inscripciones")
    .update({ estado: "aprobada", jugador_id: jugador.id })
    .eq("id", inscripcionId);

  if (errUpd) {
    console.error("Error actualizando inscripción:", errUpd);
    return { ok: false, error: "Jugador creado pero no se actualizó el estado" };
  }

  // Categoría para el email
  const { data: cat } = await supabase
    .from("categorias")
    .select("nombre")
    .eq("id", categoriaId)
    .maybeSingle();

  await enviarEmailBienvenida({
    nombreNino: inscripcion.nombreNino,
    nombreApoderado: inscripcion.nombreApoderado,
    email: inscripcion.email,
    categoria: (cat as { nombre: string } | null)?.nombre ?? "la academia",
  });

  revalidatePath("/dashboard/inscripciones");
  revalidatePath("/dashboard/jugadores");
  return { ok: true, jugadorId: jugador.id };
}

export async function rechazarInscripcion(
  inscripcionId: string,
  nota: string,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("inscripciones")
    .update({ estado: "rechazada", notas_admin: nota || null })
    .eq("id", inscripcionId);

  if (error) return { ok: false, error: "No se pudo rechazar" };

  revalidatePath("/dashboard/inscripciones");
  return { ok: true };
}
