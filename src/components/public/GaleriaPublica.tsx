"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GaleriaFoto } from "@/lib/db/schema";

export function GaleriaPublica({ fotos }: { fotos: GaleriaFoto[] }) {
  const [activa, setActiva] = useState<GaleriaFoto | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {fotos.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiva(f)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-white/5"
          >
            <Image
              src={f.fotoUrl}
              alt={f.titulo ?? "Foto de la galería"}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={!!activa} onOpenChange={(v) => !v && setActiva(null)}>
        <DialogContent className="max-w-3xl border-white/10 bg-nav p-2">
          <DialogTitle className="sr-only">
            {activa?.titulo ?? "Foto"}
          </DialogTitle>
          {activa && (
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={activa.fotoUrl}
                alt={activa.titulo ?? "Foto de la galería"}
                fill
                sizes="(max-width:768px) 100vw, 768px"
                className="rounded-lg object-contain"
              />
            </div>
          )}
          {activa?.titulo && (
            <p className="px-2 pb-1 pt-2 text-center text-sm text-white/70">
              {activa.titulo}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
