"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Trash2, User } from "lucide-react";
import { subirFotoJugador, eliminarFotoJugador } from "@/lib/actions/fotos";

export function FotoJugador({
  id,
  fotoUrl,
  nombre,
}: {
  id: string;
  fotoUrl: string | null;
  nombre: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(fotoUrl);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("foto", file);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    startTransition(async () => {
      const res = await subirFotoJugador(id, fd);
      if (!res.ok) {
        toast.error(res.error ?? "Error al subir");
        setPreview(fotoUrl);
        return;
      }
      toast.success("Foto actualizada");
      setPreview(res.url ?? localPreview);
      router.refresh();
    });
  }

  function quitar() {
    startTransition(async () => {
      const res = await eliminarFotoJugador(id);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      setPreview(null);
      toast.success("Foto eliminada");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-32 w-32">
        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md ring-1 ring-black/5">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <User size={48} />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          aria-label="Cambiar foto"
          className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-md transition-colors hover:bg-brand/90 disabled:opacity-60"
        >
          <Camera size={16} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onPick}
        />
      </div>

      {preview && (
        <button
          type="button"
          onClick={quitar}
          disabled={pending}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-bad"
        >
          <Trash2 size={13} />
          Quitar foto
        </button>
      )}
      {pending && <span className="text-xs text-gray-400">Procesando...</span>}
    </div>
  );
}
