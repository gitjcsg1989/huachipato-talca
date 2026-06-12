"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generarMensualidadesMes } from "@/lib/actions/mensualidades";
import { MESES } from "@/lib/utils";

export function GenerarMesButton({ anio }: { anio: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [monto, setMonto] = useState("20000");

  function generar() {
    startTransition(async () => {
      const res = await generarMensualidadesMes(mes, anio, Number(monto) || 0);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success(`Mensualidades generadas (${res.creadas ?? 0} jugadores)`);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">
        <Plus size={16} />
        Generar mes
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar mensualidades</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Crea una mensualidad pendiente para todos los jugadores activos en el
            mes seleccionado. No modifica las ya pagadas.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Mes ({anio})</Label>
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                {MESES.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Monto base (CLP)</Label>
              <Input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
          <Button
            onClick={generar}
            disabled={pending}
            className="w-full bg-brand text-white hover:bg-brand/90"
          >
            {pending ? "Generando..." : "Generar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
