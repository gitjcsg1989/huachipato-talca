"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/utils";
import { COOKIE_ESCUELA } from "@/lib/data/escuelas";

export type ActionResult = { ok: boolean; error?: string; slug?: string };

function fd(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

const CATEGORIAS_BASE = [
  { nombre: "Sub-6", slug: "sub-6", anio_min: 2019, anio_max: 2020 },
  { nombre: "Sub-8", slug: "sub-8", anio_min: 2017, anio_max: 2018 },
  { nombre: "Sub-10", slug: "sub-10", anio_min: 2015, anio_max: 2016 },
  { nombre: "Sub-12", slug: "sub-12", anio_min: 2013, anio_max: 2014 },
  { nombre: "Sub-14", slug: "sub-14", anio_min: 2011, anio_max: 2012 },
  { nombre: "Sub-16", slug: "sub-16", anio_min: 2009, anio_max: 2010 },
];

/** Crea una escuela con datos de ejemplo y su primer admin. Solo superadmin. */
export async function crearEscuela(formData: FormData): Promise<ActionResult> {
  const profile = await checkRole("superadmin");
  if (!profile) return { ok: false, error: "Solo el superadmin puede crear escuelas" };

  const nombre = fd(formData, "nombre");
  const slug = slugify(fd(formData, "slug") || nombre);
  if (nombre.length < 3) return { ok: false, error: "Nombre muy corto" };
  if (!slug) return { ok: false, error: "Slug inválido" };

  const adminEmail = fd(formData, "admin_email");
  const adminPassword = fd(formData, "admin_password");
  const adminNombre = fd(formData, "admin_nombre") || "Administrador";
  if (!adminEmail || adminPassword.length < 8) {
    return { ok: false, error: "Email y contraseña (mín. 8) del admin requeridos" };
  }

  const admin = createAdminClient();

  // 1) Crear escuela
  const { data: escuela, error: errEsc } = await admin
    .from("escuelas")
    .insert({
      slug,
      nombre,
      logo_url: fd(formData, "logo_url") || null,
      color_primary: fd(formData, "color_primary") || "#2952c8",
      color_primary_soft: fd(formData, "color_primary_soft") || "#6a8ee0",
      email_contacto: fd(formData, "email_contacto") || null,
      telefono_whatsapp: fd(formData, "telefono_whatsapp") || null,
      direccion: fd(formData, "direccion") || null,
      hero_titulo: "Formamos deportistas, forjamos personas",
    })
    .select("id, slug")
    .single();

  if (errEsc) {
    if (errEsc.code === "23505")
      return { ok: false, error: "Ya existe una escuela con ese slug" };
    console.error("Error creando escuela:", errEsc);
    return { ok: false, error: "No se pudo crear la escuela" };
  }
  const eid = escuela.id as string;

  // 2) Crear admin de la escuela (auth + perfil)
  const { data: created, error: errAuth } = await admin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });
  if (errAuth || !created.user) {
    await admin.from("escuelas").delete().eq("id", eid);
    return { ok: false, error: errAuth?.message ?? "No se pudo crear el admin" };
  }
  await admin.from("profiles").insert({
    id: created.user.id,
    escuela_id: eid,
    nombre: adminNombre,
    email: adminEmail,
    rol: "admin",
    activo: true,
  });

  // 3) Seed de ejemplo
  await admin
    .from("categorias")
    .insert(CATEGORIAS_BASE.map((c) => ({ ...c, escuela_id: eid })));

  await admin.from("noticias").insert([
    {
      escuela_id: eid,
      titulo: "¡Bienvenidos a nuestra escuela de fútbol!",
      slug: "bienvenida",
      categoria: "general",
      imagen_url: "/banner/1.png",
      extracto: "Comienza una nueva etapa de formación deportiva.",
      contenido:
        "Te damos la bienvenida a nuestra academia. Aquí formamos deportistas y personas con disciplina y valores.\n\nEdita o elimina esta noticia desde el panel.",
      publicada: true,
    },
  ]);

  await admin.from("productos").insert([
    { escuela_id: eid, nombre: "Camiseta Oficial", descripcion: "Camiseta titular.", precio: 24990, imagen_url: "/banner/4.png", categoria: "camisetas", disponible: true, destacado: true, nuevo: true },
    { escuela_id: eid, nombre: "Short Deportivo", descripcion: "Short de entrenamiento.", precio: 12990, imagen_url: "/banner/2.png", categoria: "shorts", disponible: true, destacado: true, nuevo: false },
    { escuela_id: eid, nombre: "Medias", descripcion: "Medias oficiales.", precio: 6990, imagen_url: "/banner/5.png", categoria: "medias", disponible: true, destacado: true, nuevo: false },
  ]);

  await admin.from("galeria_fotos").insert(
    [1, 2, 3].map((n, i) => ({ escuela_id: eid, foto_url: `/banner/${n}.png`, orden: i })),
  );

  await admin.from("cuerpo_tecnico").insert([
    { escuela_id: eid, nombre: "Entrenador Ejemplo", cargo: "Director Técnico", foto_url: "/banner/5.png", orden: 1 },
  ]);

  revalidatePath("/dashboard/escuelas");
  revalidatePath("/");
  return { ok: true, slug: escuela.slug as string };
}

/** Actualiza marca/contacto de una escuela. Solo superadmin. */
export async function actualizarEscuela(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await checkRole("superadmin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("escuelas")
    .update({
      nombre: fd(formData, "nombre"),
      logo_url: fd(formData, "logo_url") || null,
      color_primary: fd(formData, "color_primary") || "#2952c8",
      color_primary_soft: fd(formData, "color_primary_soft") || "#6a8ee0",
      email_contacto: fd(formData, "email_contacto") || null,
      telefono_whatsapp: fd(formData, "telefono_whatsapp") || null,
      direccion: fd(formData, "direccion") || null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar" };

  revalidatePath("/dashboard/escuelas");
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Cambia la escuela activa del superadmin (cookie). */
export async function cambiarEscuelaActiva(id: string): Promise<ActionResult> {
  const profile = await checkRole("superadmin");
  if (!profile) return { ok: false, error: "No autorizado" };
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_ESCUELA, id, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
