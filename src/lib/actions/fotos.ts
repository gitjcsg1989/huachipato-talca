"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkRole } from "@/lib/auth/guards";

export type ActionResult = { ok: boolean; error?: string; url?: string };

const BUCKET = "jugadores";
const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

/** Sube/reemplaza la foto de un jugador y guarda la URL en foto_url. */
export async function subirFotoJugador(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const file = formData.get("foto");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No se recibió ninguna imagen" };
  }
  if (!TIPOS.includes(file.type)) {
    return { ok: false, error: "Formato no permitido (usa JPG, PNG o WebP)" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "La imagen supera los 5 MB" };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${id}/foto.${ext}`;
  const admin = createAdminClient();

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (upErr) {
    console.error("Error subiendo foto:", upErr);
    return { ok: false, error: "No se pudo subir la imagen" };
  }

  // URL pública con cache-bust para reflejar el cambio al instante
  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
  const url = `${pub.publicUrl}?t=${Date.now()}`;

  const supabase = await createClient();
  const { error: dbErr } = await supabase
    .from("jugadores")
    .update({ foto_url: url })
    .eq("id", id);

  if (dbErr) {
    console.error("Error guardando foto_url:", dbErr);
    return {
      ok: false,
      error:
        "Imagen subida, pero falta la columna foto_url. Ejecuta el ALTER TABLE indicado.",
    };
  }

  revalidatePath(`/dashboard/jugadores/${id}`);
  revalidatePath("/dashboard/jugadores");
  return { ok: true, url };
}

/** Elimina la foto del jugador. */
export async function eliminarFotoJugador(id: string): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const admin = createAdminClient();
  await admin.storage
    .from(BUCKET)
    .remove([`${id}/foto.jpg`, `${id}/foto.png`, `${id}/foto.webp`]);

  const supabase = await createClient();
  await supabase.from("jugadores").update({ foto_url: null }).eq("id", id);

  revalidatePath(`/dashboard/jugadores/${id}`);
  revalidatePath("/dashboard/jugadores");
  return { ok: true };
}
