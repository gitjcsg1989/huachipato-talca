import { createClient } from "@/lib/supabase/server";
import { toCamel } from "@/lib/utils";
import type { Ingreso, Gasto } from "@/lib/db/schema";

export interface PuntoMes {
  mes: string;
  ingresos: number;
  gastos: number;
}

export interface ResumenFinanzas {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  porMes: PuntoMes[];
  ultimosIngresos: Ingreso[];
  ultimosGastos: Gasto[];
}

const ABREV = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export async function getResumenFinanzas(
  escuelaId: string | null,
  anio: number,
): Promise<ResumenFinanzas> {
  const vacio: ResumenFinanzas = {
    totalIngresos: 0,
    totalGastos: 0,
    balance: 0,
    porMes: [],
    ultimosIngresos: [],
    ultimosGastos: [],
  };
  if (!escuelaId) return vacio;
  const supabase = await createClient();
  const desde = `${anio}-01-01`;
  const hasta = `${anio}-12-31`;

  const [ingRes, gasRes, ultIng, ultGas] = await Promise.all([
    supabase.from("ingresos").select("monto, fecha").eq("escuela_id", escuelaId).gte("fecha", desde).lte("fecha", hasta),
    supabase.from("gastos").select("monto, fecha").eq("escuela_id", escuelaId).gte("fecha", desde).lte("fecha", hasta),
    supabase.from("ingresos").select("*").eq("escuela_id", escuelaId).order("fecha", { ascending: false }).limit(5),
    supabase.from("gastos").select("*").eq("escuela_id", escuelaId).order("fecha", { ascending: false }).limit(5),
  ]);

  const porMes: PuntoMes[] = ABREV.map((m) => ({ mes: m, ingresos: 0, gastos: 0 }));
  let totalIngresos = 0;
  let totalGastos = 0;

  for (const r of (ingRes.data as { monto: number; fecha: string }[] | null) ?? []) {
    const idx = new Date(r.fecha).getMonth();
    porMes[idx].ingresos += r.monto;
    totalIngresos += r.monto;
  }
  for (const r of (gasRes.data as { monto: number; fecha: string }[] | null) ?? []) {
    const idx = new Date(r.fecha).getMonth();
    porMes[idx].gastos += r.monto;
    totalGastos += r.monto;
  }

  return {
    totalIngresos,
    totalGastos,
    balance: totalIngresos - totalGastos,
    porMes,
    ultimosIngresos: toCamel<Ingreso[]>(ultIng.data ?? []),
    ultimosGastos: toCamel<Gasto[]>(ultGas.data ?? []),
  };
}

export async function getIngresos(escuelaId: string | null): Promise<Ingreso[]> {
  if (!escuelaId) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("ingresos")
    .select("*")
    .eq("escuela_id", escuelaId)
    .order("fecha", { ascending: false })
    .limit(100);
  return toCamel<Ingreso[]>(data ?? []);
}

export async function getGastos(escuelaId: string | null): Promise<Gasto[]> {
  if (!escuelaId) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("gastos")
    .select("*")
    .eq("escuela_id", escuelaId)
    .order("fecha", { ascending: false })
    .limit(100);
  return toCamel<Gasto[]>(data ?? []);
}
