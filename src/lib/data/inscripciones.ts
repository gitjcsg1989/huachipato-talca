import { createClient } from "@/lib/supabase/server";
import { toCamel } from "@/lib/utils";
import type { Inscripcion, EstadoInscripcion } from "@/lib/db/schema";

export async function getInscripciones(
  estado?: EstadoInscripcion,
): Promise<Inscripcion[]> {
  const supabase = await createClient();
  let query = supabase
    .from("inscripciones")
    .select("*")
    .order("created_at", { ascending: false });
  if (estado) query = query.eq("estado", estado);
  const { data } = await query;
  return toCamel<Inscripcion[]>(data ?? []);
}
