import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://escuelahuachipato.cl",
  ),
  title: {
    default: "Academia de Fútbol Huachipato — Filial Talca",
    template: "%s · Academia Huachipato Talca",
  },
  description:
    "Academia de Fútbol Huachipato, Filial Talca. Formación deportiva para niños y jóvenes. Noticias, categorías, tienda e inscripciones.",
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "Academia de Fútbol Huachipato Talca",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
