"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { crearJugador, actualizarJugador } from "@/lib/actions/jugadores";
import { PARENTESCOS } from "@/lib/validators";
import type { Categoria } from "@/lib/db/schema";
import type { JugadorRow } from "@/lib/data/jugadores";

export function JugadorForm({
  categorias,
  jugador,
}: {
  categorias: Categoria[];
  jugador?: JugadorRow;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const res = jugador
        ? await actualizarJugador(jugador.id, formData)
        : await crearJugador(formData);
      if (!res.ok) {
        setError(res.error ?? "Error al guardar");
        toast.error(res.error ?? "Error al guardar");
        return;
      }
      toast.success(jugador ? "Jugador actualizado" : "Jugador creado");
      router.push(`/dashboard/jugadores/${res.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Nombre" name="nombre" defaultValue={jugador?.nombre} required />
        <Campo
          label="Apellido"
          name="apellido"
          defaultValue={jugador?.apellido}
          required
        />
        <Campo
          label="RUT (opcional)"
          name="rut"
          defaultValue={jugador?.rut ?? ""}
          placeholder="12.345.678-9"
        />
        <Campo
          label="Fecha de nacimiento"
          name="fecha_nacimiento"
          type="date"
          defaultValue={jugador?.fechaNacimiento}
          required
        />
        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <select
            name="categoria_id"
            defaultValue={jugador?.categoriaId ?? ""}
            required
            className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="" disabled>
              Selecciona...
            </option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t pt-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Datos del apoderado
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            label="Nombre del apoderado"
            name="nombre_apoderado"
            defaultValue={jugador?.nombreApoderado}
            required
          />
          <div className="space-y-1.5">
            <Label htmlFor="parentesco_apoderado">Parentesco</Label>
            <select
              id="parentesco_apoderado"
              name="parentesco_apoderado"
              defaultValue={jugador?.parentescoApoderado ?? ""}
              className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
            >
              <option value="">Sin especificar</option>
              {PARENTESCOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <Campo
            label="Teléfono"
            name="telefono_apoderado"
            defaultValue={jugador?.telefonoApoderado}
            placeholder="+56912345678"
            required
          />
          <Campo
            label="Email (opcional)"
            name="email_apoderado"
            type="email"
            defaultValue={jugador?.emailApoderado ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notas internas</Label>
        <textarea
          name="notas"
          defaultValue={jugador?.notas ?? ""}
          rows={3}
          className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-bad">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand text-white hover:bg-brand/90"
        >
          {pending ? "Guardando..." : jugador ? "Guardar cambios" : "Crear jugador"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Campo({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="bg-white"
      />
    </div>
  );
}
