"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Check, ExternalLink } from "lucide-react";
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
import {
  crearEscuela,
  actualizarEscuela,
  cambiarEscuelaActiva,
} from "@/lib/actions/escuelas";
import type { Escuela } from "@/lib/db/schema";

export function EscuelasAdmin({
  escuelas,
  activaId,
}: {
  escuelas: Escuela[];
  activaId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openNueva, setOpenNueva] = useState(false);
  const [edit, setEdit] = useState<Escuela | null>(null);

  function crear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const res = await crearEscuela(formData);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Escuela creada con datos de ejemplo");
      setOpenNueva(false);
      form.reset();
      router.refresh();
    });
  }

  function actualizar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!edit) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await actualizarEscuela(edit.id, formData);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Escuela actualizada");
      setEdit(null);
      router.refresh();
    });
  }

  function gestionar(id: string) {
    startTransition(async () => {
      const res = await cambiarEscuelaActiva(id);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Ahora gestionas esta escuela");
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{escuelas.length} escuelas</p>
        <Button onClick={() => setOpenNueva(true)} className="bg-brand text-white hover:bg-brand/90">
          <Plus size={16} /> Nueva escuela
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {escuelas.map((e) => (
          <div key={e.id} className="rounded-xl border border-black/[0.06] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg"
                style={{ background: e.colorPrimary }}
              >
                {e.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.logoUrl} alt={e.nombre} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-lg font-black text-white">
                    {e.nombre.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{e.nombre}</p>
                <p className="text-xs text-gray-400">/{e.slug}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {activaId === e.id ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-ok/15 px-2 py-1 text-xs font-medium text-ok">
                  <Check size={13} /> Gestionando
                </span>
              ) : (
                <Button size="sm" variant="outline" onClick={() => gestionar(e.id)} disabled={pending}>
                  Gestionar
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setEdit(e)}>
                <Pencil size={14} />
              </Button>
              <a
                href={`/${e.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md px-2 py-1 text-xs text-gray-500 hover:text-brand"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Crear */}
      <Dialog open={openNueva} onOpenChange={setOpenNueva}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva escuela</DialogTitle>
          </DialogHeader>
          <form onSubmit={crear} className="space-y-4">
            <Campos />
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Primer administrador
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="admin_nombre">Nombre</Label>
                  <Input id="admin_nombre" name="admin_nombre" className="bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin_email">Email</Label>
                    <Input id="admin_email" name="admin_email" type="email" required className="bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin_password">Contraseña</Label>
                    <Input id="admin_password" name="admin_password" type="text" minLength={8} required className="bg-white" />
                  </div>
                </div>
              </div>
            </div>
            <Button type="submit" disabled={pending} className="w-full bg-brand text-white hover:bg-brand/90">
              {pending ? "Creando..." : "Crear escuela"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editar */}
      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar {edit?.nombre}</DialogTitle>
          </DialogHeader>
          {edit && (
            <form onSubmit={actualizar} className="space-y-4">
              <Campos escuela={edit} />
              <Button type="submit" disabled={pending} className="w-full bg-brand text-white hover:bg-brand/90">
                {pending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Campos({ escuela }: { escuela?: Escuela }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" name="nombre" required defaultValue={escuela?.nombre} className="bg-white" />
        </div>
        {!escuela && (
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" name="slug" placeholder="ej: union-talca" className="bg-white" />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Logo</Label>
        <ImageUpload name="logo_url" folder="logos" defaultUrl={escuela?.logoUrl ?? ""} aspect="square" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="color_primary">Color principal</Label>
          <input
            id="color_primary"
            name="color_primary"
            type="color"
            defaultValue={escuela?.colorPrimary ?? "#2952c8"}
            className="h-9 w-full rounded-md border border-input bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="color_primary_soft">Color secundario</Label>
          <input
            id="color_primary_soft"
            name="color_primary_soft"
            type="color"
            defaultValue={escuela?.colorPrimarySoft ?? "#6a8ee0"}
            className="h-9 w-full rounded-md border border-input bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="telefono_whatsapp">WhatsApp</Label>
          <Input id="telefono_whatsapp" name="telefono_whatsapp" defaultValue={escuela?.telefonoWhatsapp ?? ""} className="bg-white" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email_contacto">Email</Label>
          <Input id="email_contacto" name="email_contacto" defaultValue={escuela?.emailContacto ?? ""} className="bg-white" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="direccion">Dirección</Label>
        <Input id="direccion" name="direccion" defaultValue={escuela?.direccion ?? ""} className="bg-white" />
      </div>
    </>
  );
}
