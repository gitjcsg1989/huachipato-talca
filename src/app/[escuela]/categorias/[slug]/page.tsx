import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import {
  getCategoriaPorSlug,
  getJugadoresPublicosDeCategoria,
} from "@/lib/data/categorias";
import { getEscuelaPorSlug } from "@/lib/data/escuelas";
import { calcularEdad } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ escuela: string; slug: string }>;
}): Promise<Metadata> {
  const { escuela: escSlug, slug } = await params;
  const escuela = await getEscuelaPorSlug(escSlug);
  const cat = escuela ? await getCategoriaPorSlug(escuela.id, slug) : null;
  return cat
    ? { title: cat.nombre, description: `Categoría ${cat.nombre} de la academia.` }
    : { title: "Categoría no encontrada" };
}

export default async function CategoriaDetallePage({
  params,
}: {
  params: Promise<{ escuela: string; slug: string }>;
}) {
  const { escuela: escSlug, slug } = await params;
  const escuela = await getEscuelaPorSlug(escSlug);
  if (!escuela) notFound();
  const categoria = await getCategoriaPorSlug(escuela.id, slug);
  if (!categoria) notFound();
  const base = `/${escSlug}`;

  const jugadores = await getJugadoresPublicosDeCategoria(categoria.id);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <Link
        href={`${base}/categorias`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
      >
        <ArrowLeft size={15} />
        Volver a categorías
      </Link>

      <h1 className="text-4xl font-black text-white">{categoria.nombre}</h1>
      <p className="mt-1 text-sm font-medium uppercase tracking-wider text-white/40">
        Nacidos entre {categoria.anioMin} y {categoria.anioMax}
      </p>

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
