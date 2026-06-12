"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registrarIngreso, registrarGasto } from "@/lib/actions/finanzas";

export function MovimientoForm({
  tipo,
  categorias,
}: {
  tipo: "ingreso" | "gasto";
  categorias: readonly string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(undefined);
    startTransition(async () => {
      const res =
        tipo === "ingreso"
          ? await registrarIngreso(formData)
          : await registrarGasto(formData);
      if (!res.ok) {
        setError(res.error ?? "Error");
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success(tipo === "ingreso" ? "Ingreso registrado" : "Gasto registrado");
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="concepto">Concepto</Label>
        <Input id="concepto" name="concepto" required className="bg-white" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="categoria">Categoría</Label>
          <select
            id="categoria"
            name="categoria"
            required
            defaultValue=""
            className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="" disabled>
              Selecciona...
            </option>
            {categorias.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="monto">Monto (CLP)</Label>
          <Input
            id="monto"
            name="monto"
            type="number"
            min={1}
            required
            className="bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fecha">Fecha</Label>
          <Input
            id="fecha"
            name="fecha"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="bg-white"
          />
        </div>
        {tipo === "gasto" && (
          <div className="space-y-1.5">
            <Label htmlFor="proveedor">Proveedor (opcional)</Label>
            <Input id="proveedor" name="proveedor" className="bg-white" />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-bad">{error}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-brand text-white hover:bg-brand/90"
      >
        {pending ? "Guardando..." : tipo === "ingreso" ? "Registrar ingreso" : "Registrar gasto"}
      </Button>
    </form>
  );
}
