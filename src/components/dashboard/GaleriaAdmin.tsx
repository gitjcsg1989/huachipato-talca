"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subirFotoGaleria, eliminarFotoGaleria } from "@/lib/actions/contenido";
import type { GaleriaFoto } from "@/lib/db/schema";

export function GaleriaAdmin({ fotos }: { fotos: GaleriaFoto[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    startTransition(async () => {
      let ok = 0;
      for (const file of files) {
        const fd = new FormData();
        fd.append("imagen", file);
        const res = await subirFotoGaleria(fd);
        if (res.ok) ok++;
        else toast.error(res.error ?? "Error al subir una foto");
      }
      if (ok > 0) toast.success(`${ok} foto(s) subida(s)`);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  }

  function borrar(id: string) {
    startTransition(async () => {
      const res = await eliminarFotoGaleria(id);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Foto eliminada");
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{fotos.length} fotos</p>
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="bg-brand text-white hover:bg-brand/90"
        >
          <ImagePlus size={16} />
          {pending ? "Subiendo..." : "Subir fotos"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={onPick}
        />
      </div>

      {fotos.length === 0 ? (
        <p className="rounded-xl border border-black/[0.06] bg-white p-10 text-center text-gray-400">
          Aún no hay fotos. Usa “Subir fotos” para agregar (puedes elegir varias a la vez).
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {fotos.map((f) => (
            <div
              key={f.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-black/[0.06] bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.fotoUrl} alt={f.titulo ?? ""} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => borrar(f.id)}
                disabled={pending}
                aria-label="Eliminar foto"
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-bad group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
