import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo de la escuela. Si no se pasa logoUrl/nombre, usa el de Huachipato (panel/login). */
export function Logo({
  className,
  size = 38,
  logoUrl,
  nombre,
}: {
  className?: string;
  size?: number;
  logoUrl?: string | null;
  nombre?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={logoUrl || "/logo-huachipato.png"}
        alt={nombre || "Academia de Fútbol Huachipato Filial Talca"}
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      {nombre ? (
        <span className="max-w-[190px] text-sm font-black leading-tight tracking-tight text-white">
          {nombre}
        </span>
      ) : (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-black tracking-tight text-white">
            ACADEMIA DE FÚTBOL
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-soft">
            Huachipato · Filial Talca
          </span>
        </span>
      )}
    </span>
  );
}
