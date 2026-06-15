"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guardarAjustes } from "@/lib/actions/contenido";
import type { Escuela } from "@/lib/db/schema";

export function AjustesForm({ ajustes }: { ajustes: Escuela | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await guardarAjustes(formData);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success("Ajustes guardados");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-5 rounded-xl border border-black/[0.06] bg-white p-6 shadow-sm"
    >
      <Campo label="Título del hero" name="hero_titulo" defaultValue={ajustes?.heroTitulo} />
      <Area label="Subtítulo del hero" name="hero_subtitulo" defaultValue={ajustes?.heroSubtitulo} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="WhatsApp" name="telefono_whatsapp" defaultValue={ajustes?.telefonoWhatsapp} placeholder="+56912345678" />
        <Campo label="Email de contacto" name="email_contacto" defaultValue={ajustes?.emailContacto} />
        <Campo label="Instagram (URL)" name="instagram" defaultValue={ajustes?.instagram} />
        <Campo label="Facebook (URL)" name="facebook" defaultValue={ajustes?.facebook} />
      </div>

      <Campo label="Dirección" name="direccion" defaultValue={ajustes?.direccion} />
      <Area label="Horario de entrenamiento" name="horario_entrenamiento" defaultValue={ajustes?.horarioEntrenamiento} />
      <Area
        label="Datos de transferencia (para la tienda)"
        name="datos_transferencia"
        defaultValue={ajustes?.datosTransferencia}
        placeholder="Banco, tipo de cuenta, número, nombre, RUT, email"
      />

      <Button type="submit" disabled={pending} className="bg-brand text-white hover:bg-brand/90">
        {pending ? "Guardando..." : "Guardar ajustes"}
      </Button>
    </form>
  );
}

function Campo({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="bg-white" />
    </div>
  );
}

function Area({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        rows={3}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
      />
    </div>
  );
}
