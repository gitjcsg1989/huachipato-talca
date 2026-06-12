"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";
import { guardarNoticia, eliminarNoticia } from "@/lib/actions/contenido";
import { formatFecha } from "@/lib/utils";
import type { Noticia } from "@/lib/db/schema";

const CATEGORIAS = ["general", "resultados", "eventos", "comunicados"];

export function NoticiasAdmin({ noticias }: { noticias: Noticia[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Noticia | null>(null);
  const [pending, startTransition] = useTransition();

  function abrirNueva() {
    setEdit(null);
    setOpen(true);
  }
  function abrirEditar(n: Noticia) {
    setEdit(n);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await guardarNoticia(formData, edit?.id);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success(edit ? "Noticia actualizada" : "Noticia creada");
      setOpen(false);
      router.refresh();
    });
  }

  function borrar(n: Noticia) {
    if (!confirm(`¿Eliminar la noticia "${n.titulo}"?`)) return;
    startTransition(async () => {
      const res = await eliminarNoticia(n.id);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Noticia eliminada");
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{noticias.length} noticias</p>
        <Button onClick={abrirNueva} className="bg-brand text-white hover:bg-brand/90">
          <Plus size={16} /> Nueva noticia
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {noticias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-gray-400">
                  Aún no hay noticias. Crea la primera.
                </TableCell>
              </TableRow>
            ) : (
              noticias.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium">{n.titulo}</TableCell>
                  <TableCell className="capitalize">{n.categoria}</TableCell>
                  <TableCell>{formatFecha(n.fecha)}</TableCell>
                  <TableCell>
                    {n.publicada ? (
                      <Badge className="bg-ok/15 text-ok hover:bg-ok/15">Publicada</Badge>
                    ) : (
                      <Badge variant="secondary">Borrador</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => abrirEditar(n)}>
                        <Pencil size={15} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => borrar(n)}
                        className="text-bad hover:text-bad"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{edit ? "Editar noticia" : "Nueva noticia"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" name="titulo" required defaultValue={edit?.titulo} className="bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  defaultValue={edit?.fecha ?? new Date().toISOString().slice(0, 10)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="categoria">Categoría</Label>
                <select
                  id="categoria"
                  name="categoria"
                  defaultValue={edit?.categoria ?? "general"}
                  className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm capitalize"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Imagen</Label>
              <ImageUpload name="imagen_url" folder="noticias" defaultUrl={edit?.imagenUrl ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="extracto">Extracto (resumen corto)</Label>
              <textarea
                id="extracto"
                name="extracto"
                rows={2}
                defaultValue={edit?.extracto ?? ""}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contenido">Contenido</Label>
              <textarea
                id="contenido"
                name="contenido"
                rows={6}
                defaultValue={edit?.contenido ?? ""}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                placeholder="Escribe el texto de la noticia. Separa párrafos con una línea en blanco."
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="publicada"
                defaultChecked={edit ? edit.publicada : true}
                className="h-4 w-4"
              />
              Publicada (visible en el sitio)
            </label>
            <Button type="submit" disabled={pending} className="w-full bg-brand text-white hover:bg-brand/90">
              {pending ? "Guardando..." : "Guardar noticia"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
