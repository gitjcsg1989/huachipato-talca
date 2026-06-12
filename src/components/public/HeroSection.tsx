import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      {/* Franjas azul/negro de marca como fondo */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #2952c8 0 60px, transparent 60px 120px)",
        }}
      />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/20 blur-[120px]" />

      <div className="relative mx-auto max-w-[1280px] px-5 py-24 lg:px-8 lg:py-32">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full border border-border-blue bg-brand-dim px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-soft">
            Club Deportivo Huachipato · Filial Talca
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {titulo}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            {subtitulo}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand/90"
            >
              Inscribir a mi hijo/a
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/categorias"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/5"
            >
              Ver categorías
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
