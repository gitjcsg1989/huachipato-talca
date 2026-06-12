"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/utils";

export type ActionResult = { ok: boolean; error?: string; url?: string };

const BUCKET = "contenido";
const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

function fd(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function extDe(tipo: string) {
  return tipo === "image/png" ? "png" : tipo === "image/webp" ? "webp" : "jpg";
}

async function subirArchivo(
  folder: string,
  file: File,
): Promise<{ url?: string; error?: string }> {
  if (!TIPOS.includes(file.type)) return { error: "Formato no permitido (JPG, PNG o WebP)" };
  if (file.size > MAX_BYTES) return { error: "La imagen supera los 5 MB" };
  const admin = createAdminClient();
  const path = `${folder}/${crypto.randomUUID()}.${extDe(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });
  if (error) {
    console.error("Error subiendo archivo:", error);
    return { error: "No se pudo subir la imagen" };
  }
  return { url: admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

/** Sube una imagen y devuelve su URL pública (para formularios). */
export async function subirImagen(
  folder: string,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };
  const file = formData.get("imagen");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "No se recibió ninguna imagen" };
  const { url, error } = await subirArchivo(folder, file);
  if (error) return { ok: false, error };
  return { ok: true, url };
}

// ════════════════ NOTICIAS ════════════════
export async function guardarNoticia(
  formData: FormData,
  id?: string,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const titulo = fd(formData, "titulo");
  if (titulo.length < 3) return { ok: false, error: "El título es muy corto" };

  const fila = {
    titulo,
    slug: fd(formData, "slug") || slugify(titulo) || `noticia-${Date.now()}`,
    fecha: fd(formData, "fecha") || new Date().toISOString().slice(0, 10),
    categoria: fd(formData, "categoria") || "general",
    imagen_url: fd(formData, "imagen_url") || null,
    extracto: fd(formData, "extracto") || null,
    contenido: fd(formData, "contenido") || null,
    publicada: formData.get("publicada") === "on" || formData.get("publicada") === "true",
  };

  const supabase = await createClient();
  let res;
  if (id) {
    res = await supabase.from("noticias").update(fila).eq("id", id);
  } else {
    res = await supabase.from("noticias").insert(fila);
  }
  if (res.error) {
    if (res.error.code === "23505") {
      // slug duplicado → reintenta con sufijo
      fila.slug = `${fila.slug}-${Date.now().toString(36).slice(-4)}`;
      const retry = id
        ? await supabase.from("noticias").update(fila).eq("id", id)
        : await supabase.from("noticias").insert(fila);
      if (retry.error) return { ok: false, error: "No se pudo guardar la noticia" };
    } else {
      console.error("Error guardando noticia:", res.error);
      return { ok: false, error: "No se pudo guardar la noticia" };
    }
  }
  revalidatePath("/dashboard/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
  return { ok: true };
}

export async function eliminarNoticia(id: string): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };
  const supabase = await createClient();
  const { error } = await supabase.from("noticias").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar" };
  revalidatePath("/dashboard/noticias");
  revalidatePath("/noticias");
  return { ok: true };
}

// ════════════════ PRODUCTOS ════════════════
export async function guardarProducto(
  formData: FormData,
  id?: string,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const nombre = fd(formData, "nombre");
  if (nombre.length < 2) return { ok: false, error: "Nombre inválido" };
  const precio = parseInt(fd(formData, "precio") || "0", 10);
  if (Number.isNaN(precio) || precio < 0)
    return { ok: false, error: "Precio inválido" };

  const fila = {
    nombre,
    descripcion: fd(formData, "descripcion") || null,
    precio,
    imagen_url: fd(formData, "imagen_url") || null,
    categoria: fd(formData, "categoria") || "accesorios",
    disponible: formData.get("disponible") === "true",
    destacado: formData.get("destacado") === "true",
    nuevo: formData.get("nuevo") === "true",
  };

  const supabase = await createClient();
  const res = id
    ? await supabase.from("productos").update(fila).eq("id", id)
    : await supabase.from("productos").insert(fila);
  if (res.error) {
    console.error("Error guardando producto:", res.error);
    return { ok: false, error: "No se pudo guardar el producto" };
  }
  revalidatePath("/dashboard/tienda");
  revalidatePath("/tienda");
  revalidatePath("/");
  return { ok: true };
}

export async function eliminarProducto(id: string): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };
  const supabase = await createClient();
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar" };
  revalidatePath("/dashboard/tienda");
  revalidatePath("/tienda");
  return { ok: true };
}

// ════════════════ GALERÍA ════════════════
export async function subirFotoGaleria(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };
  const file = formData.get("imagen");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "No se recibió ninguna imagen" };

  const { url, error } = await subirArchivo("galeria", file);
  if (error) return { ok: false, error };

  const supabase = await createClient();
  const { error: dbErr } = await supabase.from("galeria_fotos").insert({
    foto_url: url,
    titulo: fd(formData, "titulo") || null,
  });
  if (dbErr) {
    console.error("Error guardando foto galería:", dbErr);
    return { ok: false, error: "Imagen subida pero no se registró" };
  }
  revalidatePath("/dashboard/galeria");
  revalidatePath("/galeria");
  return { ok: true, url };
}

export async function eliminarFotoGaleria(id: string): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };
  const supabase = await createClient();
  const { error } = await supabase.from("galeria_fotos").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar" };
  revalidatePath("/dashboard/galeria");
  revalidatePath("/galeria");
  return { ok: true };
}

// ════════════════ CUERPO TÉCNICO ════════════════
export async function guardarMiembro(
  formData: FormData,
  id?: string,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const nombre = fd(formData, "nombre");
  const cargo = fd(formData, "cargo");
  if (nombre.length < 2) return { ok: false, error: "Nombre inválido" };
  if (cargo.length < 2) return { ok: false, error: "Indica el cargo" };

  const fila = {
    nombre,
    cargo,
    foto_url: fd(formData, "foto_url") || null,
    descripcion: fd(formData, "descripcion") || null,
    orden: parseInt(fd(formData, "orden") || "0", 10) || 0,
  };

  const supabase = await createClient();
  const res = id
    ? await supabase.from("cuerpo_tecnico").update(fila).eq("id", id)
    : await supabase.from("cuerpo_tecnico").insert(fila);
  if (res.error) {
    console.error("Error guardando miembro:", res.error);
    return { ok: false, error: "No se pudo guardar" };
  }
  revalidatePath("/dashboard/cuerpo-tecnico");
  revalidatePath("/cuerpo-tecnico");
  return { ok: true };
}

export async function eliminarMiembro(id: string): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };
  const supabase = await createClient();
  const { error } = await supabase.from("cuerpo_tecnico").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar" };
  revalidatePath("/dashboard/cuerpo-tecnico");
  revalidatePath("/cuerpo-tecnico");
  return { ok: true };
}

// ════════════════ AJUSTES ════════════════
export async function guardarAjustes(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const fila = {
    id: 1,
    hero_titulo: fd(formData, "hero_titulo") || null,
    hero_subtitulo: fd(formData, "hero_subtitulo") || null,
    telefono_whatsapp: fd(formData, "telefono_whatsapp") || null,
    email_contacto: fd(formData, "email_contacto") || null,
    datos_transferencia: fd(formData, "datos_transferencia") || null,
    instagram: fd(formData, "instagram") || null,
    facebook: fd(formData, "facebook") || null,
    horario_entrenamiento: fd(formData, "horario_entrenamiento") || null,
    direccion: fd(formData, "direccion") || null,
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ajustes")
    .upsert(fila, { onConflict: "id" });
  if (error) {
    console.error("Error guardando ajustes:", error);
    return { ok: false, error: "No se pudieron guardar los ajustes" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
