"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
  crearUsuario,
  cambiarRolUsuario,
  cambiarEstadoUsuario,
} from "@/lib/actions/usuarios";
import type { Profile, Rol } from "@/lib/db/schema";

export function UsuariosPanel({
  usuarios,
  miId,
}: {
  usuarios: Profile[];
  miId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function onCrear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(undefined);
    startTransition(async () => {
      const res = await crearUsuario(formData);
      if (!res.ok) {
        setError(res.error ?? "Error");
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Usuario creado");
      form.reset();
      router.refresh();
    });
  }

  function cambiarRol(id: string, rol: Rol) {
    startTransition(async () => {
      const res = await cambiarRolUsuario(id, rol);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Rol actualizado");
      router.refresh();
    });
  }

  function toggleEstado(id: string, activo: boolean) {
    startTransition(async () => {
      const res = await cambiarEstadoUsuario(id, !activo);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success(activo ? "Usuario desactivado" : "Usuario activado");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
      {/* Crear usuario */}
      <div className="rounded-xl border border-black/[0.06] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Nuevo usuario
        </h2>
        <form onSubmit={onCrear} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" required className="bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rol">Rol</Label>
            <select
              id="rol"
              name="rol"
              defaultValue="admin"
              className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">SuperAdmin</option>
            </select>
          </div>
          {error && <p className="text-sm text-bad">{error}</p>}
          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-brand text-white hover:bg-brand/90"
          >
            {pending ? "Creando..." : "Crear usuario"}
          </Button>
        </form>
      </div>

      {/* Lista */}
      <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nombre}</TableCell>
                <TableCell className="text-gray-500">{u.email}</TableCell>
                <TableCell>
                  <select
                    value={u.rol}
                    onChange={(e) => cambiarRol(u.id, e.target.value as Rol)}
                    disabled={pending || u.id === miId}
                    className="h-8 rounded-md border border-input bg-white px-2 text-xs"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">SuperAdmin</option>
                  </select>
                </TableCell>
                <TableCell>
                  {u.activo ? (
                    <Badge className="bg-ok/15 text-ok hover:bg-ok/15">Activo</Badge>
                  ) : (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {u.id !== miId && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => toggleEstado(u.id, u.activo)}
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
