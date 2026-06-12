import { createClient } from "@/lib/supabase/server";
import { toCamel } from "@/lib/utils";
import type { Profile } from "@/lib/db/schema";

export async function getUsuarios(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  return toCamel<Profile[]>(data ?? []);
}
