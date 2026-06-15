"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  inscripcionSchema,
  type InscripcionInput,
  PARENTESCOS,
} from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const inputCls =
  "bg-white/5 border-white/10 text-white placeholder:text-white/30";

export function InscripcionForm({
  categorias,
  escuelaId,
}: {
  categorias: string[];
  escuelaId: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InscripcionInput>({
    resolver: zodResolver(inscripcionSchema),
  });

  async function onSubmit(values: InscripcionInput) {
    try {
      const res = await fetch("/api/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, escuela_id: escuelaId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json.error ?? "No se pudo enviar la inscripción");
        return;
      }
      toast.success("¡Inscripción enviada! Te contactaremos pronto.");
      reset();
    } catch {
      toast.error("Error de conexión. Intenta nuevamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Nombre del niño/a" error={errors.nombre_nino?.message}>
        <Input className={inputCls} {...register("nombre_nino")} />
      </Field>

      <Field
        label="Fecha de nacimiento"
        error={errors.fecha_nacimiento?.message}
      >
        <Input type="date" className={inputCls} {...register("fecha_nacimiento")} />
      </Field>

      <Field
        label="Categoría de interés"
        error={errors.categoria_interes?.message}
      >
        <select
          className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
          defaultValue=""
          {...register("categoria_interes")}
        >
          <option value="" disabled className="text-black">
            Selecciona...
          </option>
          {categorias.map((c) => (
            <option key={c} value={c} className="text-black">
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Nombre del apoderado" error={errors.nombre_apoderado?.message}>
        <Input className={inputCls} {...register("nombre_apoderado")} />
      </Field>

      <Field
        label="Parentesco con el niño/a"
        error={errors.parentesco_apoderado?.message}
      >
        <select
          className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
          defaultValue=""
          {...register("parentesco_apoderado")}
        >
          <option value="" disabled className="text-black">
            Selecciona...
          </option>
          {PARENTESCOS.map((p) => (
            <option key={p} value={p} className="text-black">
              {p}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Teléfono" error={errors.telefono?.message}>
          <Input
            className={inputCls}
            placeholder="+56912345678"
            {...register("telefono")}
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" className={inputCls} {...register("email")} />
        </Field>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand text-white hover:bg-brand/90"
      >
        {isSubmitting ? "Enviando..." : "Enviar inscripción"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/70">{label}</Label>
      {children}
      {error && <p className="text-xs text-bad">{error}</p>}
    </div>
  );
}
