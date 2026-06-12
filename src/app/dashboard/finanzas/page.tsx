import Link from "next/link";
import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FinanzasChart } from "@/components/dashboard/FinanzasChart";
import { getResumenFinanzas } from "@/lib/data/finanzas";
import { formatCLP, formatFecha } from "@/lib/utils";

export default async function FinanzasPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string }>;
}) {
  const profile = await requireProfile();
  const sp = await searchParams;
  const anio = Number(sp.anio) || new Date().getFullYear();
  const r = await getResumenFinanzas(anio);

  return (
    <>
      <Topbar titulo="Finanzas" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/finanzas?anio=${anio - 1}`}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
            >
              ←
            </Link>
            <span className="min-w-[64px] text-center text-lg font-bold">
              {anio}
            </span>
            <Link
              href={`/dashboard/finanzas?anio=${anio + 1}`}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
            >
              →
            </Link>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/finanzas/ingresos"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Ingresos
            </Link>
            <Link
              href="/dashboard/finanzas/gastos"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Gastos
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard label={`Ingresos ${anio}`} valor={formatCLP(r.totalIngresos)} acento="ok" />
          <StatsCard label={`Gastos ${anio}`} valor={formatCLP(r.totalGastos)} acento="bad" />
          <StatsCard
            label={`Balance ${anio}`}
            valor={formatCLP(r.balance)}
            acento={r.balance >= 0 ? "ok" : "bad"}
          />
        </div>

        <div className="mt-6 rounded-xl border border-black/[0.06] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Ingresos vs Gastos por mes
          </h2>
          <FinanzasChart datos={r.porMes} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ListaMovimientos
            titulo="Últimos ingresos"
            items={r.ultimosIngresos.map((i) => ({
              id: i.id,
              concepto: i.concepto,
              fecha: i.fecha,
              monto: i.monto,
            }))}
            color="text-ok"
          />
          <ListaMovimientos
            titulo="Últimos gastos"
            items={r.ultimosGastos.map((g) => ({
              id: g.id,
              concepto: g.concepto,
              fecha: g.fecha,
              monto: g.monto,
            }))}
            color="text-bad"
          />
        </div>
      </div>
    </>
  );
}

function ListaMovimientos({
  titulo,
  items,
  color,
}: {
  titulo: string;
  items: { id: string; concepto: string; fecha: string; monto: number }[];
  color: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
        {titulo}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Sin movimientos.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-900">{i.concepto}</p>
                <p className="text-xs text-gray-400">{formatFecha(i.fecha)}</p>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${color}`}>
                {formatCLP(i.monto)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
