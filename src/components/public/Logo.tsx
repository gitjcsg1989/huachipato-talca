import Image from "next/image";
import { cn } from "@/lib/utils";

/** Escudo oficial Academia de Fútbol Huachipato — Filial Talca. */
export function Logo({
  className,
  size = 38,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo-huachipato.png"
        alt="Academia de Fútbol Huachipato Filial Talca"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      <span className="flex flex-col leading-none">
        <span className="text-sm font-black tracking-tight text-white">
          ACADEMIA DE FÚTBOL
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-soft">
          Huachipato · Filial Talca
        </span>
      </span>
    </span>
  );
}
