"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Categoria } from "@/lib/db/schema";

export function MensualidadCategoriaFiltro({
  categorias,
}: {
  categorias: Categoria[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function set(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("categoria", value);
    else next.delete("categoria");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <select
      defaultValue={params.get("categoria") ?? ""}
      onChange={(e) => set(e.target.value)}
      className="h-9 rounded-md border border-input bg-white px-3 text-sm"
    >
      <option value="">Todas las categorías</option>
      {categorias.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nombre}
        </option>
      ))}
    </select>
  );
}
