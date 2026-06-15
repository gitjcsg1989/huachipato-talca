import Link from "next/link";
import Image from "next/image";
import { formatFecha } from "@/lib/utils";
import type { Noticia } from "@/lib/db/schema";

export function NewsCard({ noticia, base }: { noticia: Noticia; base: string }) {
  const img = noticia.imagenUrl;

  return (
    <Link
      href={`${base}/noticias/${noticia.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-surface-dark transition-colors hover:border-border-blue"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
        {img ? (
          <Image
            src={img}
            alt={noticia.titulo}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/20">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {noticia.categoria && (
          <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-soft">
            {noticia.categoria}
          </span>
        )}
        <h3 className="mb-2 line-clamp-2 font-bold leading-snug text-white group-hover:text-brand-soft">
          {noticia.titulo}
        </h3>
        {noticia.extracto && (
          <p className="mb-4 line-clamp-2 text-sm text-white/50">
            {noticia.extracto}
          </p>
        )}
        <time className="mt-auto text-xs text-white/30">
          {formatFecha(noticia.fecha)}
        </time>
      </div>
    </Link>
  );
}
