import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, User, Clock } from "lucide-react";
import {
  getCategoriaPorSlug,
  getJugadoresPublicosDeCategoria,
} from "@/lib/data/categorias";
import { getCategoriaPublicaPorSlug } from "@/lib/sanity/queries";
import { imgUrl } from "@/lib/sanity/client";
import { calcularEdad } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoriaPorSlug(slug);
  return cat
    ? { title: cat.nombre, description: `Categoría ${cat.nombre} de la academia.` }
    : { title: "Categoría no encontrada" };
}

export default async function CategoriaDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoria = await getCategoriaPorSlug(slug);
  if (!categoria) notFound();

  const [contenido, jugadores] = await Promise.all([
    getCategoriaPublicaPorSlug(slug),
    getJugadoresPublicosDeCategoria(categoria.id),
  ]);

  const img = imgUrl(contenido?.imagen, { width: 1280, height: 560 });

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <Link
        href="/categorias"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
      >
        <ArrowLeft size={15} />
        Volver a categorías
      </Link>

      <h1 className="text-4xl font-black text-white">{categoria.nombre}</h1>
      <p className="mt-1 text-sm font-medium uppercase tracking-wider text-white/40">
        Nacidos entre {categoria.anioMin} y {categoria.anioMax}
      </p>

      {img && (
        <div className="relative mt-8 aspect-[21/9] overflow-hidden rounded-xl">
          <Image
            src={img}
            alt={categoria.nombre}
            fill
            sizes="(max-width:896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      )}

      {contenido?.descripcion && (
        <p className="mt-8 max-w-2xl leading-relaxed text-white/70">
          {contenido.descripcion}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/60">
        {contenido?.entrenador && (
          <span className="inline-flex items-center gap-2">
            <User size={16} className="text-brand-soft" />
            {contenido.entrenador}
          </span>
        )}
        {contenido?.horario && (
          <span className="inline-flex items-center gap-2">
            <Clock size={16} className="text-brand-soft" />
            {contenido.horario}
          </span>
        )}
      </div>

      {/* Plantel */}
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-white">
          Plantel ({jugadores.length})
        </h2>
        {jugadores.length === 0 ? (
          <p className="text-sm text-white/40">
            Aún no hay jugadores registrados en esta categoría.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {jugadores.map((j) => (
              <li
                key={j.id}
                className="group overflow-hidden rounded-xl border border-white/[0.06] bg-surface-dark transition-colors hover:border-border-blue"
              >
                <div className="relative aspect-square overflow-hidden bg-white/5">
                  {j.fotoUrl ? (
                    <Image
                      src={j.fotoUrl}
                      alt={`${j.nombre} ${j.apellido}`}
                      fill
                      sizes="(max-width:768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/15">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-semibold text-white">
                    {j.nombre} {j.apellido}
                  </p>
                  <p className="text-xs text-brand-soft">
                    {calcularEdad(j.fechaNacimiento)} años
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
