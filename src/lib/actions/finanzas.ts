"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRole } from "@/lib/auth/guards";
import { getEscuelaActivaId } from "@/lib/data/escuelas";
import { movimientoSchema } from "@/lib/validators";

export type ActionResult = { ok: boolean; error?: string };

function fd(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function registrarIngreso(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const parsed = movimientoSchema.safeParse({
    concepto: fd(formData, "concepto"),
    categoria: fd(formData, "categoria"),
    monto: fd(formData, "monto"),
    fecha: fd(formData, "fecha"),
    jugador_id: fd(formData, "jugador_id"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  const d = parsed.data;
  const escuelaId = await getEscuelaActivaId();
  if (!escuelaId) return { ok: false, error: "Sin escuela activa" };

  const supabase = await createClient();
  const { error } = await supabase.from("ingresos").insert({
    escuela_id: escuelaId,
    concepto: d.concepto,
    categoria: d.categoria,
    monto: d.monto,
    fecha: d.fecha,
    jugador_id: d.jugador_id || null,
    registrado_por: profile.id,
  });

  if (error) {
    console.error("Error registrando ingreso:", error);
    return { ok: false, error: "No se pudo registrar el ingreso" };
  }

  revalidatePath("/dashboard/finanzas");
  return { ok: true };
}

export async function registrarGasto(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const parsed = movimientoSchema.safeParse({
    concepto: fd(formData, "concepto"),
    categoria: fd(formData, "categoria"),
    monto: fd(formData, "monto"),
    fecha: fd(formData, "fecha"),
    proveedor: fd(formData, "proveedor"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  const d = parsed.data;
  const escuelaId = await getEscuelaActivaId();
  if (!escuelaId) return { ok: false, error: "Sin escuela activa" };

  const supabase = await createClient();
  const { error } = await supabase.from("gastos").insert({
    escuela_id: escuelaId,
    concepto: d.concepto,
    categoria: d.categoria,
    monto: d.monto,
    fecha: d.fecha,
    proveedor: d.proveedor || null,
    registrado_por: profile.id,
  });

  if (error) {
    console.error("Error registrando gasto:", error);
    return { ok: false, error: "No se pudo registrar el gasto" };
  }

  revalidatePath("/dashboard/finanzas");
  return { ok: true };
}
