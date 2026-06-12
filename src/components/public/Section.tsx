import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Encabezado de sección reutilizable para el sitio público. */
export function SectionHeader({
  titulo,
  descripcion,
  verMas,
}: {
  titulo: string;
  descripcion?: string;
  verMas?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {titulo}
        </h2>
        {descripcion && (
          <p className="mt-2 max-w-xl text-sm text-white/50">{descripcion}</p>
        )}
      </div>
      {verMas && (
        <Link
          href={verMas.href}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-soft hover:text-white sm:inline-flex"
        >
          {verMas.label}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

export function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mx-auto max-w-[1280px] px-5 py-16 lg:px-8", className)}>
      {children}
    </section>
  );
}
