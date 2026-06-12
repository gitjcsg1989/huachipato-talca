"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { imgUrl } from "@/lib/sanity/client";
import { formatFecha } from "@/lib/utils";
import type { AlbumGaleria } from "@/lib/sanity/queries";

export function GalleryGrid({ albumes }: { albumes: AlbumGaleria[] }) {
  const [activo, setActivo] = useState<AlbumGaleria | null>(null);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {albumes.map((album) => {
          const portada =
            imgUrl(album.portada, { width: 640, height: 420 }) ??
            imgUrl(album.fotos?.[0], { width: 640, height: 420 });
          return (
            <button
              key={album._id}
              type="button"
              onClick={() => setActivo(album)}
              className="group overflow-hidden rounded-xl border border-white/[0.06] bg-surface-dark text-left"
            >
              <div className="relative aspect-[3/2] bg-white/5">
                {portada ? (
                  <Image
                    src={portada}
                    alt={album.titulo}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/20">
                    Álbum
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white">{album.titulo}</h3>
                <p className="text-xs text-white/40">
                  {formatFecha(album.fecha)} · {album.fotos?.length ?? 0} fotos
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!activo} onOpenChange={(v) => !v && setActivo(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{activo?.titulo}</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[70vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {activo?.fotos?.map((foto, i) => {
              const src = imgUrl(foto, { width: 400, height: 400 });
              return src ? (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  <Image
                    src={src}
                    alt={foto.caption ?? `Foto ${i + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
              ) : null;
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
