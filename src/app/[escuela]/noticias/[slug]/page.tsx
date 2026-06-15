import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getNoticiaPorSlug } from "@/lib/data/contenido";
import { getEscuelaPorSlug } from "@/lib/data/escuelas";
import { formatFecha } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ escuela: string; slug: string }>;
}): Promise<Metadata> {
  const { escuela: escSlug, slug } = await params;
  const escuela = await getEscuelaPorSlug(escSlug);
  const noticia = escuela ? await getNoticiaPorSlug(escuela.id, slug) : null;
  if (!noticia) return { title: "Noticia no encontrada" };
  return {
    title: noticia.titulo,
    description: noticia.extracto ?? undefined,
    openGraph: noticia.imagenUrl ? { images: [noticia.imagenUrl] } : undefined,
  };
}

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ escuela: string; slug: string }>;
}) {
  const { escuela: escSlug, slug } = await params;
  const escuela = await getEscuelaPorSlug(escSlug);
  if (!escuela) notFound();
  const noticia = await getNoticiaPorSlug(escuela.id, slug);
  if (!noticia || !noticia.publicada) notFound();
  const base = `/${escSlug}`;

  const parrafos = (noticia.contenido ?? "")
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
      <Link
        href={`${base}/noticias`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
      >
        <ArrowLeft size={15} />
        Volver a noticias
      </Link>

      {noticia.categoria && (
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-soft">
          {noticia.categoria}
        </span>
      )}
      <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
        {noticia.titulo}
      </h1>
      <time className="mt-3 block text-sm text-white/40">
        {formatFecha(noticia.fecha)}
      </time>

      {noticia.imagenUrl && (
        <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-xl">
          <Image
            src={noticia.imagenUrl}
            alt={noticia.titulo}
            fill
            priority
            sizes="(max-width:768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-8 space-y-4">
        {parrafos.length > 0 ? (
          parrafos.map((p, i) => (
            <p key={i} className="leading-relaxed text-white/70">
              {p}
            </p>
          ))
        ) : (
          <p className="text-white/40">Esta noticia no tiene contenido.</p>
        )}
      </div>
    </article>
  );
}
