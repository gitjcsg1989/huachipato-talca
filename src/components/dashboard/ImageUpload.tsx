"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { subirImagen } from "@/lib/actions/contenido";

/**
 * Sube una imagen a storage y guarda la URL resultante en un input oculto
 * (`name`) para que el formulario contenedor la envíe.
 */
export function ImageUpload({
  name,
  folder,
  defaultUrl = "",
  aspect = "video",
}: {
  name: string;
  folder: string;
  defaultUrl?: string;
  aspect?: "video" | "square";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultUrl);
  const [pending, startTransition] = useTransition();

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("imagen", file);
    startTransition(async () => {
      const res = await subirImagen(folder, fd);
      if (!res.ok || !res.url) {
        toast.error(res.error ?? "No se pudo subir");
        return;
      }
      setUrl(res.url);
      toast.success("Imagen subida");
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <div
        className={`relative w-full overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 ${
          aspect === "square" ? "aspect-square" : "aspect-video"
        }`}
      >
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setUrl("")}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              aria-label="Quitar imagen"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400 hover:text-brand"
          >
            <ImagePlus size={28} />
            <span className="text-xs font-medium">
              {pending ? "Subiendo..." : "Subir imagen"}
            </span>
          </button>
        )}
      </div>
      {url && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="mt-2 text-xs font-medium text-brand hover:underline"
        >
          {pending ? "Subiendo..." : "Cambiar imagen"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}
