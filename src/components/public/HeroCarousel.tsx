"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  "/banner/1.png",
  "/banner/2.png",
  "/banner/3.png",
  "/banner/4.png",
  "/banner/5.png",
];

const INTERVALO = 3000;

export function HeroCarousel({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo: string;
}) {
  const [actual, setActual] = useState(0);
  const total = SLIDES.length;

  const ir = useCallback(
    (i: number) => setActual((i + total) % total),
    [total],
  );

  useEffect(() => {
    const t = setInterval(() => setActual((a) => (a + 1) % total), INTERVALO);
    return () => clearInterval(t);
  }, [total]);

  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      {/* Track deslizante */}
      <div
        className="flex h-[clamp(340px,56vh,520px)] transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${actual * 100}%)` }}
      >
        {SLIDES.map((src, i) => (
          <div key={src} className="relative h-full w-full shrink-0">
            <Image
              src={src}
              alt={`Academia Huachipato Talca — imagen ${i + 1}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Overlay degradado para legibilidad */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />

      {/* Contenido del hero */}
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col px-5 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full border border-border-blue bg-brand-dim px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-soft backdrop-blur">
              Club Deportivo Huachipato · Filial Talca
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              {titulo}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 drop-shadow sm:text-lg">
              {subtitulo}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand/90"
              >
                Inscribir a mi hijo/a
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/categorias"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                Ver categorías
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Flechas */}
      <button
        type="button"
        onClick={() => ir(actual - 1)}
        aria-label="Anterior"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur transition-colors hover:bg-black/50 sm:block"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={() => ir(actual + 1)}
        aria-label="Siguiente"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur transition-colors hover:bg-black/50 sm:block"
      >
        <ChevronRight size={22} />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => ir(i)}
            aria-label={`Ir a la imagen ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all",
              i === actual ? "w-6 bg-brand" : "w-2 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </section>
  );
}
