"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/db/schema";

const FILTROS = [
  { value: "todos", label: "Todos" },
  { value: "camisetas", label: "Camisetas" },
  { value: "shorts", label: "Shorts" },
  { value: "medias", label: "Medias" },
  { value: "accesorios", label: "Accesorios" },
  { value: "kits", label: "Kits" },
];

export function TiendaGrid({
  productos,
  datosTransferencia,
  telefonoWhatsapp,
}: {
  productos: Producto[];
  datosTransferencia?: string | null;
  telefonoWhatsapp?: string | null;
}) {
  const [filtro, setFiltro] = useState("todos");

  const visibles = useMemo(
    () =>
      filtro === "todos"
        ? productos
        : productos.filter((p) => p.categoria === filtro),
    [productos, filtro],
  );

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFiltro(f.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filtro === f.value
                ? "bg-brand text-white"
                : "border border-white/10 text-white/60 hover:text-white",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-surface-dark p-10 text-center text-white/40">
          No hay productos en esta categoría.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibles.map((p) => (
            <ProductCard
              key={p.id}
              producto={p}
              datosTransferencia={datosTransferencia}
              telefonoWhatsapp={telefonoWhatsapp}
            />
          ))}
        </div>
      )}
    </>
  );
}
