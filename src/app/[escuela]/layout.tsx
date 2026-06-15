import { notFound } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { getEscuelaPorSlug } from "@/lib/data/escuelas";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ escuela: string }>;
}) {
  const { escuela: slug } = await params;
  const escuela = await getEscuelaPorSlug(slug);
  if (!escuela) notFound();

  return (
    <div
      className="flex min-h-screen flex-col bg-ink text-white"
      style={
        {
          "--color-brand": escuela.colorPrimary,
          "--color-brand-soft": escuela.colorPrimarySoft,
        } as React.CSSProperties
      }
    >
      <Navbar slug={escuela.slug} nombre={escuela.nombre} logoUrl={escuela.logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer escuela={escuela} />
    </div>
  );
}
