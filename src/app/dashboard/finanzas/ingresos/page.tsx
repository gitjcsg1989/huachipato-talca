import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { MovimientoForm } from "@/components/dashboard/MovimientoForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getIngresos } from "@/lib/data/finanzas";
import { getEscuelaActivaId } from "@/lib/data/escuelas";
import { CATEGORIAS_INGRESO } from "@/types";
import { formatCLP, formatFecha } from "@/lib/utils";

export default async function IngresosPage() {
  const profile = await requireProfile();
  const ingresos = await getIngresos(await getEscuelaActivaId());

  return (
    <>
      <Topbar titulo="Ingresos" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <Link
          href="/dashboard/finanzas"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={15} />
          Volver a finanzas
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <div className="rounded-xl border border-black/[0.06] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Registrar ingreso
            </h2>
            <MovimientoForm tipo="ingreso" categorias={CATEGORIAS_INGRESO} />
          </div>

          <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingresos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-gray-400">
                      Sin ingresos registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  ingresos.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.concepto}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {i.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFecha(i.fecha)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-ok">
                        {formatCLP(i.monto)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
