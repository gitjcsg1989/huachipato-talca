"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRole } from "@/lib/auth/guards";

export type ActionResult = { ok: boolean; error?: string };

/** Registra el pago de una mensualidad (la crea si no existe). */
export async function registrarPago(args: {
  jugadorId: string;
  mes: number;
  anio: number;
  monto: number;
  fechaPago: string;
  metodoPago: "transferencia" | "efectivo";
  notas?: string;
}): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const supabase = await createClient();
  const { error } = await supabase.from("mensualidades").upsert(
    {
      jugador_id: args.jugadorId,
      mes: args.mes,
      anio: args.anio,
      monto: args.monto,
      estado: "pagado",
      fecha_pago: args.fechaPago,
      metodo_pago: args.metodoPago,
      notas: args.notas || null,
    },
    { onConflict: "jugador_id,mes,anio" },
  );

  if (error) {
    console.error("Error registrando pago:", error);
    return { ok: false, error: "No se pudo registrar el pago" };
  }

  revalidatePath("/dashboard/mensualidades");
  return { ok: true };
}

/** Revierte un pago: vuelve la mensualidad a pendiente. */
export async function revertirPago(
  jugadorId: string,
  mes: number,
  anio: number,
): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("mensualidades")
    .update({ estado: "pendiente", fecha_pago: null, metodo_pago: null })
    .eq("jugador_id", jugadorId)
    .eq("mes", mes)
    .eq("anio", anio);

  if (error) return { ok: false, error: "No se pudo revertir" };

  revalidatePath("/dashboard/mensualidades");
  return { ok: true };
}

/** Marca una mensualidad como exenta. */
export async function marcarExento(args: {
  jugadorId: string;
  mes: number;
  anio: number;
}): Promise<ActionResult> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const supabase = await createClient();
  const { error } = await supabase.from("mensualidades").upsert(
    {
      jugador_id: args.jugadorId,
      mes: args.mes,
      anio: args.anio,
      monto: 0,
      estado: "exento",
    },
    { onConflict: "jugador_id,mes,anio" },
  );

  if (error) return { ok: false, error: "No se pudo marcar como exento" };
  revalidatePath("/dashboard/mensualidades");
  return { ok: true };
}

/**
 * Genera registros de mensualidad (pendiente) para todos los jugadores activos
 * de un mes/año, con un monto base. No duplica los existentes.
 */
export async function generarMensualidadesMes(
  mes: number,
  anio: number,
  monto: number,
): Promise<ActionResult & { creadas?: number }> {
  const profile = await checkRole("admin");
  if (!profile) return { ok: false, error: "No autorizado" };

  const supabase = await createClient();
  const { data: jugadores } = await supabase
    .from("jugadores")
    .select("id")
    .eq("activo", true);

  const ids = ((jugadores as { id: string }[] | null) ?? []).map((j) => j.id);
  if (ids.length === 0) return { ok: true, creadas: 0 };

  const filas = ids.map((id) => ({
    jugador_id: id,
    mes,
    anio,
    monto,
    estado: "pendiente" as const,
  }));

  // ignoreDuplicates evita pisar mensualidades ya pagadas.
  const { error } = await supabase
    .from("mensualidades")
    .upsert(filas, { onConflict: "jugador_id,mes,anio", ignoreDuplicates: true });

  if (error) {
    console.error("Error generando mensualidades:", error);
    return { ok: false, error: "No se pudieron generar las mensualidades" };
  }

  revalidatePath("/dashboard/mensualidades");
  return { ok: true, creadas: ids.length };
}
