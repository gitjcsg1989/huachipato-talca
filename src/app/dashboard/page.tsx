import { Users, ClipboardList, CalendarDays, Wallet } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { getResumen } from "@/lib/data/dashboard";
import { formatCLP, nombreMes } from "@/lib/utils";

export default async function DashboardHome() {
  const profile = await requireProfile();
  const resumen = await getResumen();
  const mesActual = nombreMes(new Date().getMonth() + 1);

  return (
    <>
      <Topbar titulo="Resumen" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <p className="mb-6 text-sm text-gray-500">
          Hola {profile.nombre.split(" ")[0]}, este es el estado de la academia en{" "}
          {mesActual}.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Jugadores activos"
            valor={resumen.jugadoresActivos}
            icon={<Users size={18} />}
            href="/dashboard/jugadores"
            acento="brand"
          />
          <StatsCard
            label="Inscripciones pendientes"
            valor={resumen.inscripcionesPendientes}
            icon={<ClipboardList size={18} />}
            href="/dashboard/inscripciones"
            acento="warn"
            badge
          />
          <StatsCard
            label={`Mensualidades pend. (${mesActual})`}
            valor={resumen.mensualidadesPendientesMes}
            icon={<CalendarDays size={18} />}
            href="/dashboard/mensualidades"
            acento="warn"
          />
          <StatsCard
            label={`Balance ${mesActual}`}
            valor={formatCLP(resumen.balanceMes)}
            icon={<Wallet size={18} />}
            href="/dashboard/finanzas"
            acento={resumen.balanceMes >= 0 ? "ok" : "bad"}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-black/[0.06] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Ingresos del mes
            </p>
            <p className="mt-2 text-2xl font-extrabold text-ok">
              {formatCLP(resumen.ingresosMes)}
            </p>
          </div>
          <div className="rounded-xl border border-black/[0.06] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Gastos del mes
            </p>
            <p className="mt-2 text-2xl font-extrabold text-bad">
              {formatCLP(resumen.gastosMes)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
