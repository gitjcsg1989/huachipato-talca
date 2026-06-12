import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Webhook de Sanity → revalida el cache ISR al publicar/editar contenido.
 * Configurar en sanity.io/manage → API → Webhooks apuntando a:
 *   POST https://<dominio>/api/webhooks/sanity
 * con el secret de SANITY_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type: string }>(
      req,
      process.env.SANITY_WEBHOOK_SECRET,
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { ok: false, error: "Firma inválida" },
        { status: 401 },
      );
    }

    if (!body?._type) {
      return NextResponse.json(
        { ok: false, error: "Falta _type en el payload" },
        { status: 400 },
      );
    }

    revalidateTag(body._type, "max");
    return NextResponse.json({ ok: true, data: { revalidated: body._type } });
  } catch (err) {
    console.error("Error en webhook de Sanity:", err);
    return NextResponse.json(
      { ok: false, error: "Error procesando el webhook" },
      { status: 500 },
    );
  }
}
