"use client";

import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCLP, whatsappLink } from "@/lib/utils";
import type { Producto } from "@/lib/db/schema";

export function ComprarDialog({
  abierto,
  onClose,
  producto,
  datosTransferencia,
  telefonoWhatsapp,
}: {
  abierto: boolean;
  onClose: () => void;
  producto: Producto;
  datosTransferencia?: string | null;
  telefonoWhatsapp?: string | null;
}) {
  const mensaje = `Hola, quiero comprar: ${producto.nombre} (${formatCLP(
    producto.precio,
  )}).`;

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{producto.nombre}</DialogTitle>
          <DialogDescription>
            {formatCLP(producto.precio)} — Compra manual por WhatsApp o
            transferencia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {telefonoWhatsapp && (
            <a
              href={whatsappLink(telefonoWhatsapp, mensaje)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 font-semibold text-white"
            >
              <MessageCircle size={18} />
              Pedir por WhatsApp
            </a>
          )}

          {datosTransferencia && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="mb-1 font-semibold">Datos de transferencia</p>
              <p className="whitespace-pre-line text-muted-foreground">
                {datosTransferencia}
              </p>
            </div>
          )}

          {!telefonoWhatsapp && !datosTransferencia && (
            <p className="text-muted-foreground">
              Configura el WhatsApp y los datos de transferencia en Ajustes del
              sitio (Sanity Studio).
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
