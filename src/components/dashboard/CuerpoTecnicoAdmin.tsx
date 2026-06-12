"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";
import { guardarMiembro, eliminarMiembro } from "@/lib/actions/contenido";
import type { MiembroTecnico } from "@/lib/db/schema";

export function CuerpoTecnicoAdmin({ miembros }: { miembros: MiembroTecnico[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<MiembroTecnico | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await guardarMiembro(formData, edit?.id);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success(edit ? "Miembro actualizado" : "Miembro agregado");
      setOpen(false);
      router.refresh();
    });
  }

  function borrar(m: MiembroTecnico) {
    if (!confirm(`¿Eliminar a ${m.nombre}?`)) return;
    startTransition(async () => {
      const res = await eliminarMiembro(m.id);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Miembro eliminado");
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{miembros.length} miembros</p>
        <Button
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
          className="bg-brand text-white hover:bg-brand/90"
        >
          <Plus size={16} /> Nuevo miembro
        </Button>
      </div>

      {miembros.length === 0 ? (
        <p className="rounded-xl border border-black/[0.06] bg-white p-10 text-center text-gray-400">
          Aún no hay miembros. Agrega el primero.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {miembros.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 rounded-xl border border-black/[0.06] bg-white p-4 shadow-sm"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100">
                {m.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.fotoUrl} alt={m.nombre} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <User size={28} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{m.nombre}</p>
                <p className="truncate text-sm text-brand">{m.cargo}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setEdit(m); setOpen(true); }}>
                  <Pencil size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => borrar(m)} className="text-bad hover:text-bad">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{edit ? "Editar miembro" : "Nuevo miembro"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" required defaultValue={edit?.nombre} className="bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cargo">Cargo</Label>
              <Input id="cargo" name="cargo" required defaultValue={edit?.cargo} placeholder="Director técnico" className="bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label>Foto</Label>
              <ImageUpload name="foto_url" folder="cuerpo" defaultUrl={edit?.fotoUrl ?? ""} aspect="square" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={2}
                defaultValue={edit?.descripcion ?? ""}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="orden">Orden de aparición</Label>
              <Input id="orden" name="orden" type="number" defaultValue={edit?.orden ?? 0} className="bg-white" />
            </div>
            <Button type="submit" disabled={pending} className="w-full bg-brand text-white hover:bg-brand/90">
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
