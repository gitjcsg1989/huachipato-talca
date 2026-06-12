"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  aprobarInscripcion,
  rechazarInscripcion,
} from "@/lib/actions/inscripciones";
import { formatFecha, calcularEdad, whatsappLink } from "@/lib/utils";
import type { Inscripcion, Categoria } from "@/lib/db/schema";

const ESTADO: Record<string, string> = {
  pendiente: "bg-warn/15 text-warn",
  aprobada: "bg-ok/15 text-ok",
  rechazada: "bg-bad/15 text-bad",
};

export function InscripcionesTabla({
  inscripciones,
  categorias,
}: {
  inscripciones: Inscripcion[];
  categorias: Categoria[];
}) {
  const router = useRouter();
  const [sel, setSel] = useState<Inscripcion | null>(null);
  const [categoriaId, setCategoriaId] = useState("");
  const [apellido, setApellido] = useState("");
  const [nota, setNota] = useState("");
  const [pending, startTransition] = useTransition();

  function abrir(i: Inscripcion) {
    setSel(i);
    setCategoriaId(categorias[0]?.id ?? "");
    setApellido("");
    setNota("");
  }

  function aprobar() {
    if (!sel) return;
    startTransition(async () => {
      const res = await aprobarInscripcion(sel.id, categoriaId, apellido);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Inscripción aprobada y jugador creado");
      setSel(null);
      router.refresh();
    });
  }

  function rechazar() {
    if (!sel) return;
    startTransition(async () => {
      const res = await rechazarInscripcion(sel.id, nota);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Inscripción rechazada");
      setSel(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Niño/a</TableHead>
              <TableHead>Categoría interés</TableHead>
              <TableHead>Apoderado</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inscripciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-gray-400">
                  No hay inscripciones.
                </TableCell>
              </TableRow>
            ) : (
              inscripciones.map((i) => (
                <TableRow
                  key={i.id}
                  className="cursor-pointer"
                  onClick={() => abrir(i)}
                >
                  <TableCell className="font-medium">{i.nombreNino}</TableCell>
                  <TableCell>{i.categoriaInteres}</TableCell>
                  <TableCell>{i.nombreApoderado}</TableCell>
                  <TableCell>{i.telefono}</TableCell>
                  <TableCell>{formatFecha(i.createdAt)}</TableCell>
                  <TableCell>
                    <Badge className={`${ESTADO[i.estado]} hover:${ESTADO[i.estado]}`}>
                      {i.estado}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!sel} onOpenChange={(v) => !v && setSel(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{sel?.nombreNino}</SheetTitle>
          </SheetHeader>

          {sel && (
            <div className="space-y-5 px-4 pb-6">
              <dl className="space-y-2 text-sm">
                <Dato label="Fecha de nacimiento">
                  {formatFecha(sel.fechaNacimiento)} (
                  {calcularEdad(sel.fechaNacimiento)} años)
                </Dato>
                <Dato label="Categoría de interés">{sel.categoriaInteres}</Dato>
                <Dato label="Apoderado">{sel.nombreApoderado}</Dato>
                {sel.parentescoApoderado && (
                  <Dato label="Parentesco">{sel.parentescoApoderado}</Dato>
                )}
                <Dato label="Teléfono">{sel.telefono}</Dato>
                <Dato label="Email">{sel.email}</Dato>
                <Dato label="Estado">{sel.estado}</Dato>
              </dl>

              <a
                href={whatsappLink(
                  sel.telefono,
                  `Hola ${sel.nombreApoderado}, te contactamos de la Academia Huachipato Talca por la inscripción de ${sel.nombreNino}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2 text-sm font-semibold text-white"
              >
                <MessageCircle size={16} />
                Contactar por WhatsApp
              </a>

              {sel.estado === "pendiente" && (
                <>
                  <div className="space-y-3 rounded-lg border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-700">
                      Aprobar inscripción
                    </p>
                    <div className="space-y-1.5">
                      <Label>Apellido del jugador</Label>
                      <Input
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        placeholder="Apellido"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Categoría asignada</Label>
                      <select
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
                      >
                        {categorias.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={aprobar}
                      disabled={pending}
                      className="w-full bg-ok text-white hover:bg-ok/90"
                    >
                      {pending ? "Procesando..." : "Aprobar y crear jugador"}
                    </Button>
                  </div>

                  <div className="space-y-3 rounded-lg border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-700">
                      Rechazar inscripción
                    </p>
                    <Input
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                      placeholder="Motivo (opcional)"
                      className="bg-white"
                    />
                    <Button
                      onClick={rechazar}
                      disabled={pending}
                      variant="outline"
                      className="w-full border-bad/30 text-bad hover:bg-bad/5"
                    >
                      Rechazar
                    </Button>
                  </div>
                </>
              )}

              {sel.estado !== "pendiente" && sel.notasAdmin && (
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  Nota: {sel.notasAdmin}
                </p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Dato({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{children}</dd>
    </div>
  );
}
