"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Categoria } from "@/lib/db/schema";

export function JugadoresFilters({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [busqueda, setBusqueda] = useState(params.get("busqueda") ?? "");

  function buildUrl(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("pagina");
    return `${pathname}?${next.toString()}`;
  }

  // Debounce de búsqueda
  useEffect(() => {
    const actual = params.get("busqueda") ?? "";
    if (busqueda === actual) return;
    const t = setTimeout(() => {
      router.push(buildUrl("busqueda", busqueda));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o apellido..."
          className="bg-white pl-9"
        />
      </div>

      <select
        defaultValue={params.get("categoria") ?? ""}
        onChange={(e) => router.push(buildUrl("categoria", e.target.value))}
        className="h-9 rounded-md border border-input bg-white px-3 text-sm"
      >
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      <select
        defaultValue={params.get("estado") ?? ""}
        onChange={(e) => router.push(buildUrl("estado", e.target.value))}
        className="h-9 rounded-md border border-input bg-white px-3 text-sm"
      >
        <option value="">Activos e inactivos</option>
        <option value="activo">Solo activos</option>
        <option value="inactivo">Solo inactivos</option>
      </select>
    </div>
  );
}
