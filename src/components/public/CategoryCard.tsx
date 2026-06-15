import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CategoryCard({
  base,
  nombre,
  slug,
  anioMin,
  anioMax,
  descripcion,
}: {
  base: string;
  nombre: string;
  slug: string;
  anioMin: number;
  anioMax: number;
  descripcion?: string;
}) {
  return (
    <Link
      href={`${base}/categorias/${slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/[0.06] bg-surface-dark p-6 transition-colors hover:border-border-blue"
    >
      <div className="absolute right-0 top-0 h-full w-1.5 bg-brand opacity-60" />
      <div>
        <h3 className="text-2xl font-extrabold text-white">{nombre}</h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/40">
          Nacidos {anioMin}–{anioMax}
        </p>
        {descripcion && (
          <p className="mt-3 line-clamp-2 text-sm text-white/50">{descripcion}</p>
        )}
      </div>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-soft">
        Ver categoría
        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}
