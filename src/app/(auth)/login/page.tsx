import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTo = redirect?.startsWith("/dashboard")
    ? redirect
    : "/dashboard";

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <Image
          src="/logo-huachipato.png"
          alt="Academia de Fútbol Huachipato Filial Talca"
          width={64}
          height={64}
          priority
          className="mx-auto mb-4 object-contain"
        />
        <h1 className="text-2xl font-extrabold">Panel de gestión</h1>
        <p className="mt-1 text-sm text-white/50">
          Academia de Fútbol Huachipato · Talca
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface-dark p-6">
        <LoginForm redirectTo={redirectTo} />
      </div>

      <p className="mt-6 text-center text-sm text-white/40">
        <Link href="/" className="hover:text-white/70">
          ← Volver al sitio
        </Link>
      </p>
    </div>
  );
}
