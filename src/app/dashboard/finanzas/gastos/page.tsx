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
import { getGastos } from "@/lib/data/finanzas";
import { CATEGORIAS_GASTO } from "@/types";
import { formatCLP, formatFecha } from "@/lib/utils";

export default async function GastosPage() {
  const profile = await requireProfile();
  const gastos = await getGastos();

  return (
    <>
      <Topbar titulo="Gastos" esSuperadmin={profile.rol === "superadmin"} />
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
              Registrar gasto
            </h2>
            <MovimientoForm tipo="gasto" categorias={CATEGORIAS_GASTO} />
          </div>

          <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gastos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-gray-400">
                      Sin gastos registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  gastos.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.concepto}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {g.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>{g.proveedor ?? "—"}</TableCell>
                      <TableCell>{formatFecha(g.fecha)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-bad">
                        {formatCLP(g.monto)}
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
