"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cambiarEstadoJugador } from "@/lib/actions/jugadores";

export function ToggleEstadoJugador({
  id,
  activo,
}: {
  id: string;
  activo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = await cambiarEstadoJugador(id, !activo);
      if (!res.ok) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success(activo ? "Jugador desactivado" : "Jugador activado");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant={activo ? "outline" : "default"}
      onClick={toggle}
      disabled={pending}
      className={activo ? "" : "bg-ok text-white hover:bg-ok/90"}
    >
      {pending ? "..." : activo ? "Desactivar jugador" : "Activar jugador"}
    </Button>
  );
}
