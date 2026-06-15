import { redirect } from "next/navigation";
import { getEscuelas } from "@/lib/data/escuelas";

// La raíz redirige a la primera escuela (Huachipato por defecto).
export default async function RootPage() {
  const escuelas = await getEscuelas();
  redirect(escuelas[0] ? `/${escuelas[0].slug}` : "/huachipato");
}
