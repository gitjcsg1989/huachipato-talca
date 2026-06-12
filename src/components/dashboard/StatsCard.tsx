import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  valor,
  icon,
  href,
  acento,
  badge,
}: {
  label: string;
  valor: string | number;
  icon?: React.ReactNode;
  href?: string;
  acento?: "ok" | "bad" | "warn" | "brand";
  badge?: boolean;
}) {
  const colorValor = {
    ok: "text-ok",
    bad: "text-bad",
    warn: "text-warn",
    brand: "text-brand",
    undefined: "text-gray-900",
  }[acento ?? "undefined"];

  const contenido = (
    <div className="rounded-xl border border-black/[0.06] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <p className={cn("mt-3 text-3xl font-extrabold tabular-nums", colorValor)}>
        {valor}
        {badge && Number(valor) > 0 && (
          <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-bad align-middle" />
        )}
      </p>
    </div>
  );

  return href ? <Link href={href}>{contenido}</Link> : contenido;
}
