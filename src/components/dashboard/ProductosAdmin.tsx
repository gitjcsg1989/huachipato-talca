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
import { guardarProducto, eliminarProducto } from "@/lib/actions/contenido";
import { formatCLP } from "@/lib/utils";
import type { Producto } from "@/lib/db/schema";

const CATEGORIAS = ["camisetas", "shorts", "medias", "accesorios", "kits"];

export function ProductosAdmin({ productos }: { productos: Producto[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Producto | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await guardarProducto(formData, edit?.id);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success(edit ? "Producto actualizado" : "Producto creado");
      setOpen(false);
      router.refresh();
    });
  }

  function borrar(p: Producto) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    startTransition(async () => {
      const res = await eliminarProducto(p.id);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Producto eliminado");
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{productos.length} productos</p>
        <Button
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
          className="bg-brand text-white hover:bg-brand/90"
        >
          <Plus size={16} /> Nuevo producto
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-gray-400">
                  Aún no hay productos. Agrega el primero.
                </TableCell>
              </TableRow>
            ) : (
              productos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell className="capitalize">{p.categoria}</TableCell>
                  <TableCell className="tabular-nums">{formatCLP(p.precio)}</TableCell>
                  <TableCell>
                    {p.disponible ? (
                      <Badge className="bg-ok/15 text-ok hover:bg-ok/15">Disponible</Badge>
                    ) : (
                      <Badge variant="secondary">Oculto</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEdit(p);
                          setOpen(true);
                        }}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => borrar(p)}
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
            <DialogTitle>{edit ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" required defaultValue={edit?.nombre} className="bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="precio">Precio (CLP)</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  min={0}
                  required
                  defaultValue={edit?.precio ?? 0}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="categoria">Categoría</Label>
                <select
                  id="categoria"
                  name="categoria"
                  defaultValue={edit?.categoria ?? "accesorios"}
                  className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm capitalize"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Imagen referencial</Label>
              <ImageUpload name="imagen_url" folder="productos" defaultUrl={edit?.imagenUrl ?? ""} aspect="square" />
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
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="disponible" value="true" defaultChecked={edit ? edit.disponible : true} className="h-4 w-4" />
                Disponible
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="destacado" value="true" defaultChecked={edit?.destacado ?? false} className="h-4 w-4" />
                Destacado (inicio)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="nuevo" value="true" defaultChecked={edit?.nuevo ?? false} className="h-4 w-4" />
                Marcar NUEVO
              </label>
            </div>
            <Button type="submit" disabled={pending} className="w-full bg-brand text-white hover:bg-brand/90">
              {pending ? "Guardando..." : "Guardar producto"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
