"use client";

import Image from "next/image";
import { useState } from "react";
import { formatCLP } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Producto } from "@/lib/db/schema";
import { ComprarDialog } from "./ComprarDialog";

export function ProductCard({
  producto,
  datosTransferencia,
  telefonoWhatsapp,
}: {
  producto: Producto;
  datosTransferencia?: string | null;
  telefonoWhatsapp?: string | null;
}) {
  const [abierto, setAbierto] = useState(false);
  const img = producto.imagenUrl;

  return (
    <>
      <div className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-surface-dark">
        <div className="relative aspect-square overflow-hidden bg-white/5">
          {img ? (
            <Image
              src={img}
              alt={producto.nombre}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/20">
              Sin imagen
            </div>
          )}
          {producto.nuevo && (
            <Badge className="absolute left-3 top-3 bg-brand text-white">
              NUEVO
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-semibold text-white">{producto.nombre}</h3>
          {producto.descripcion && (
            <p className="mt-1 line-clamp-2 text-xs text-white/40">
              {producto.descripcion}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-brand-soft">
              {formatCLP(producto.precio)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="mt-4 w-full rounded-lg bg-brand py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
          >
            Comprar
          </button>
        </div>
      </div>

      <ComprarDialog
        abierto={abierto}
        onClose={() => setAbierto(false)}
        producto={producto}
        datosTransferencia={datosTransferencia}
        telefonoWhatsapp={telefonoWhatsapp}
      />
    </>
  );
}
