import { createClient } from "@/lib/supabase/server";
import { toCamel } from "@/lib/utils";
import type { Inscripcion, EstadoInscripcion } from "@/lib/db/schema";

export async function getInscripciones(
  escuelaId: string | null,
  estado?: EstadoInscripcion,
): Promise<Inscripcion[]> {
  if (!escuelaId) return [];
  const supabase = await createClient();
  let query = supabase
    .from("inscripciones")
    .select("*")
    .eq("escuela_id", escuelaId)
    .order("created_at", { ascending: false });
  if (estado) query = query.eq("estado", estado);
  const { data } = await query;
  return toCamel<Inscripcion[]>(data ?? []);
}
