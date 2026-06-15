import { createClient } from "@/lib/supabase/server";

export async function contarInscripcionesPendientes(
  escuelaId: string | null,
): Promise<number> {
  if (!escuelaId) return 0;
  const supabase = await createClient();
  const { count } = await supabase
    .from("inscripciones")
    .select("*", { count: "exact", head: true })
    .eq("escuela_id", escuelaId)
    .eq("estado", "pendiente");
  return count ?? 0;
}

export interface ResumenDashboard {
  jugadoresActivos: number;
  inscripcionesPendientes: number;
  mensualidadesPendientesMes: number;
  ingresosMes: number;
  gastosMes: number;
  balanceMes: number;
}

export async function getResumen(
  escuelaId: string | null,
): Promise<ResumenDashboard> {
  const vacio: ResumenDashboard = {
    jugadoresActivos: 0,
    inscripcionesPendientes: 0,
    mensualidadesPendientesMes: 0,
    ingresosMes: 0,
    gastosMes: 0,
    balanceMes: 0,
  };
  if (!escuelaId) return vacio;

  const supabase = await createClient();
  const ahora = new Date();
  const mes = ahora.getMonth() + 1;
  const anio = ahora.getFullYear();
  const primerDia = `${anio}-${String(mes).padStart(2, "0")}-01`;
  const ultimoDia = `${anio}-${String(mes).padStart(2, "0")}-${String(
    new Date(anio, mes, 0).getDate(),
  ).padStart(2, "0")}`;

  const [jugadores, inscripciones, mensualidades, ingresos, gastos] =
    await Promise.all([
      supabase
        .from("jugadores")
        .select("*", { count: "exact", head: true })
        .eq("escuela_id", escuelaId)
        .eq("activo", true),
      supabase
        .from("inscripciones")
        .select("*", { count: "exact", head: true })
        .eq("escuela_id", escuelaId)
        .eq("estado", "pendiente"),
      supabase
        .from("mensualidades")
        .select("*", { count: "exact", head: true })
        .eq("escuela_id", escuelaId)
        .eq("estado", "pendiente")
        .eq("mes", mes)
        .eq("anio", anio),
      supabase
        .from("ingresos")
        .select("monto")
        .eq("escuela_id", escuelaId)
        .gte("fecha", primerDia)
        .lte("fecha", ultimoDia),
      supabase
        .from("gastos")
        .select("monto")
        .eq("escuela_id", escuelaId)
        .gte("fecha", primerDia)
        .lte("fecha", ultimoDia),
    ]);

  const sumar = (rows: { monto: number }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + r.monto, 0);

  const ingresosMes = sumar(ingresos.data as { monto: number }[] | null);
  const gastosMes = sumar(gastos.data as { monto: number }[] | null);

  return {
    jugadoresActivos: jugadores.count ?? 0,
    inscripcionesPendientes: inscripciones.count ?? 0,
    mensualidadesPendientesMes: mensualidades.count ?? 0,
    ingresosMes,
    gastosMes,
    balanceMes: ingresosMes - gastosMes,
  };
}
