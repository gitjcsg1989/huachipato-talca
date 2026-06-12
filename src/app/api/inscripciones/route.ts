import { type NextRequest, NextResponse } from "next/server";
import { createPublicClient, supabaseConfigurado } from "@/lib/supabase/server";
import { inscripcionSchema } from "@/lib/validators";
import { enviarEmailsInscripcion } from "@/lib/email";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "JSON inválido" },
      { status: 400 },
    );
  }

  const parsed = inscripcionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      {
        ok: false,
        error: "Datos incompletos",
        fields: parsed.error.issues.map((i) => String(i.path[0])),
      },
      { status: 400 },
    );
  }

  if (!supabaseConfigurado) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "El servicio no está configurado" },
      { status: 503 },
    );
  }

  const datos = parsed.data;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("inscripciones")
    .insert({
      nombre_nino: datos.nombre_nino,
      fecha_nacimiento: datos.fecha_nacimiento,
      nombre_apoderado: datos.nombre_apoderado,
      parentesco_apoderado: datos.parentesco_apoderado,
      telefono: datos.telefono,
      email: datos.email,
      categoria_interes: datos.categoria_interes,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error insertando inscripción:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "No se pudo registrar la inscripción" },
      { status: 500 },
    );
  }

  // Emails (no bloquean el éxito si fallan)
  await enviarEmailsInscripcion({
    nombreNino: datos.nombre_nino,
    nombreApoderado: datos.nombre_apoderado,
    email: datos.email,
    telefono: datos.telefono,
    categoriaInteres: datos.categoria_interes,
  });

  return NextResponse.json<ApiResponse<{ id: string }>>(
    { ok: true, data: { id: data.id } },
    { status: 201 },
  );
}
