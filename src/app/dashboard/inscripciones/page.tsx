import Link from "next/link";
import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { InscripcionesTabla } from "@/components/dashboard/InscripcionesTabla";
import { getInscripciones } from "@/lib/data/inscripciones";
import { getTodasCategorias } from "@/lib/data/categorias";
import { cn } from "@/lib/utils";
import type { EstadoInscripcion } from "@/lib/db/schema";

const TABS: { value: string; label: string }[] = [
  { value: "pendiente", label: "Pendientes" },
  { value: "aprobada", label: "Aprobadas" },
  { value: "rechazada", label: "Rechazadas" },
  { value: "", label: "Todas" },
];

export default async function InscripcionesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const profile = await requireProfile();
  const { estado } = await searchParams;
  const filtro = (estado ?? "pendiente") as EstadoInscripcion | "";

  const [inscripciones, categorias] = await Promise.all([
    getInscripciones(filtro || undefined),
    getTodasCategorias(),
  ]);

  return (
    <>
      <Topbar titulo="Inscripciones" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const activo = (estado ?? "pendiente") === t.value;
            return (
              <Link
                key={t.value || "todas"}
                href={
                  t.value
                    ? `/dashboard/inscripciones?estado=${t.value}`
                    : "/dashboard/inscripciones?estado="
                }
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activo
                    ? "bg-brand text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:text-gray-900",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        <InscripcionesTabla
          inscripciones={inscripciones}
          categorias={categorias}
        />
      </div>
    </>
  );
}
