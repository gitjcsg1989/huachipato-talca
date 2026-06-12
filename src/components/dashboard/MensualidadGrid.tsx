"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  registrarPago,
  revertirPago,
  marcarExento,
} from "@/lib/actions/mensualidades";
import { formatCLP, nombreMes } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface CeldaPlano {
  estado: "pendiente" | "pagado" | "exento";
  monto: number;
}

export interface JugadorGridPlano {
  id: string;
  nombre: string;
  apellido: string;
  categoriaNombre: string | null;
}

const MESES_NUM = Array.from({ length: 12 }, (_, i) => i + 1);
const SIMBOLO: Record<string, string> = {
  pagado: "✓",
  pendiente: "•",
  exento: "E",
};
const COLOR: Record<string, string> = {
  pagado: "bg-ok/15 text-ok",
  pendiente: "bg-warn/10 text-warn/70",
  exento: "bg-brand/10 text-brand",
  vacio: "bg-gray-50 text-gray-300",
};

export function MensualidadGrid({
  jugadores,
  celdas,
  anio,
}: {
  jugadores: JugadorGridPlano[];
  celdas: Record<string, CeldaPlano>;
  anio: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [sel, setSel] = useState<{
    jugador: JugadorGridPlano;
    mes: number;
    celda?: CeldaPlano;
  } | null>(null);
  const [monto, setMonto] = useState("0");
  const [fechaPago, setFechaPago] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [metodo, setMetodo] = useState<"transferencia" | "efectivo">(
    "transferencia",
  );

  function abrir(jugador: JugadorGridPlano, mes: number) {
    const celda = celdas[`${jugador.id}-${mes}`];
    setSel({ jugador, mes, celda });
    setMonto(String(celda?.monto || 0));
    setFechaPago(new Date().toISOString().slice(0, 10));
    setMetodo("transferencia");
  }

  function cambiarAnio(delta: number) {
    const next = new URLSearchParams(params.toString());
    next.set("anio", String(anio + delta));
    router.push(`${pathname}?${next.toString()}`);
  }

  function pagar() {
    if (!sel) return;
    startTransition(async () => {
      const res = await registrarPago({
        jugadorId: sel.jugador.id,
        mes: sel.mes,
        anio,
        monto: Number(monto) || 0,
        fechaPago,
        metodoPago: metodo,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Pago registrado");
      setSel(null);
      router.refresh();
    });
  }

  function revertir() {
    if (!sel) return;
    startTransition(async () => {
      const res = await revertirPago(sel.jugador.id, sel.mes, anio);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Pago revertido");
      setSel(null);
      router.refresh();
    });
  }

  function exento() {
    if (!sel) return;
    startTransition(async () => {
      const res = await marcarExento({
        jugadorId: sel.jugador.id,
        mes: sel.mes,
        anio,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Marcado como exento");
      setSel(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => cambiarAnio(-1)}>
          ←
        </Button>
        <span className="min-w-[64px] text-center text-lg font-bold">{anio}</span>
        <Button variant="outline" size="sm" onClick={() => cambiarAnio(1)}>
          →
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/[0.06] bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-semibold text-gray-500">
                Jugador
              </th>
              {MESES_NUM.map((m) => (
                <th
                  key={m}
                  className="px-1 py-2 text-center text-xs font-semibold text-gray-400"
                >
                  {nombreMes(m).slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jugadores.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-10 text-center text-gray-400">
                  No hay jugadores activos.
                </td>
              </tr>
            ) : (
              jugadores.map((j) => (
                <tr key={j.id} className="border-b last:border-0">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium whitespace-nowrap">
                    {j.apellido}, {j.nombre}
                    {j.categoriaNombre && (
                      <span className="ml-2 text-xs text-gray-400">
                        {j.categoriaNombre}
                      </span>
                    )}
                  </td>
                  {MESES_NUM.map((m) => {
                    const c = celdas[`${j.id}-${m}`];
                    const estado = c?.estado ?? "vacio";
                    return (
                      <td key={m} className="px-1 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => abrir(j, m)}
                          className={cn(
                            "h-7 w-7 rounded-md text-xs font-bold transition-transform hover:scale-110",
                            COLOR[estado],
                          )}
                          title={`${nombreMes(m)} · ${c?.estado ?? "sin registro"}`}
                        >
                          {c ? SIMBOLO[c.estado] : ""}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
        <span><span className="text-ok">✓</span> Pagado</span>
        <span><span className="text-warn">•</span> Pendiente</span>
        <span><span className="text-brand">E</span> Exento</span>
        <span className="text-gray-300">▢ Sin registro</span>
      </p>

      <Dialog open={!!sel} onOpenChange={(v) => !v && setSel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sel && `${sel.jugador.nombre} ${sel.jugador.apellido} · ${nombreMes(sel.mes)} ${anio}`}
            </DialogTitle>
          </DialogHeader>

          {sel?.celda?.estado === "pagado" ? (
            <div className="space-y-4">
              <p className="rounded-lg bg-ok/10 p-3 text-sm text-ok">
                Pago registrado: {formatCLP(sel.celda.monto)}
              </p>
              <Button
                variant="outline"
                onClick={revertir}
                disabled={pending}
                className="w-full border-bad/30 text-bad hover:bg-bad/5"
              >
                Revertir pago
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Monto (CLP)</Label>
                <Input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Fecha de pago</Label>
                  <Input
                    type="date"
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Método</Label>
                  <select
                    value={metodo}
                    onChange={(e) =>
                      setMetodo(e.target.value as "transferencia" | "efectivo")
                    }
                    className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
                  >
                    <option value="transferencia">Transferencia</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={pagar}
                  disabled={pending}
                  className="flex-1 bg-ok text-white hover:bg-ok/90"
                >
                  Registrar pago
                </Button>
                <Button
                  variant="outline"
                  onClick={exento}
                  disabled={pending}
                >
                  Exento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
