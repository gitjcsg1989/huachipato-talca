import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@escuelahuachipato.cl";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

const resend = apiKey ? new Resend(apiKey) : null;

function plantilla(titulo: string, cuerpoHtml: string): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0c0c14;color:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#2952c8;padding:20px 28px">
      <h1 style="margin:0;font-size:18px;font-weight:800">Academia de Fútbol Huachipato · Talca</h1>
    </div>
    <div style="padding:28px">
      <h2 style="font-size:20px;margin:0 0 16px">${titulo}</h2>
      ${cuerpoHtml}
    </div>
    <div style="padding:16px 28px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:rgba(255,255,255,0.5)">
      Academia de Fútbol Huachipato — Filial Talca
    </div>
  </div>`;
}

interface DatosInscripcion {
  nombreNino: string;
  nombreApoderado: string;
  email: string;
  telefono: string;
  categoriaInteres: string;
}

/** Envía confirmación al apoderado + notificación al admin. No tira si falla. */
export async function enviarEmailsInscripcion(datos: DatosInscripcion) {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurada — emails omitidos.");
    return;
  }

  const tareas: Promise<unknown>[] = [];

  // Confirmación al apoderado
  tareas.push(
    resend.emails.send({
      from: FROM,
      to: datos.email,
      subject: "Recibimos tu solicitud de inscripción",
      html: plantilla(
        `¡Gracias, ${datos.nombreApoderado}!`,
        `<p style="color:rgba(255,255,255,0.8);line-height:1.6">
          Recibimos la solicitud de inscripción de <strong>${datos.nombreNino}</strong>
          para la categoría <strong>${datos.categoriaInteres}</strong>.</p>
         <p style="color:rgba(255,255,255,0.8);line-height:1.6">
          Nuestro equipo la revisará y te contactaremos pronto al teléfono o correo indicado.</p>`,
      ),
    }),
  );

  // Notificación al admin
  if (ADMIN_EMAIL) {
    tareas.push(
      resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `Nueva inscripción: ${datos.nombreNino} (${datos.categoriaInteres})`,
        html: plantilla(
          "Nueva solicitud de inscripción",
          `<ul style="color:rgba(255,255,255,0.8);line-height:1.8;padding-left:18px">
            <li>Niño/a: <strong>${datos.nombreNino}</strong></li>
            <li>Apoderado: ${datos.nombreApoderado}</li>
            <li>Teléfono: ${datos.telefono}</li>
            <li>Email: ${datos.email}</li>
            <li>Categoría de interés: ${datos.categoriaInteres}</li>
          </ul>
          <p style="color:rgba(255,255,255,0.6)">Revísala en el panel → Inscripciones.</p>`,
        ),
      }),
    );
  }

  const resultados = await Promise.allSettled(tareas);
  resultados.forEach((r) => {
    if (r.status === "rejected") console.error("Error enviando email:", r.reason);
  });
}

interface DatosBienvenida {
  nombreNino: string;
  nombreApoderado: string;
  email: string;
  categoria: string;
}

/** Email de bienvenida cuando se aprueba una inscripción. */
export async function enviarEmailBienvenida(datos: DatosBienvenida) {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurada — email omitido.");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: datos.email,
      subject: "¡Bienvenido a la Academia Huachipato Talca!",
      html: plantilla(
        `¡${datos.nombreNino} fue aceptado/a!`,
        `<p style="color:rgba(255,255,255,0.8);line-height:1.6">
          Hola ${datos.nombreApoderado}, nos alegra confirmar que <strong>${datos.nombreNino}</strong>
          forma parte de la categoría <strong>${datos.categoria}</strong>.</p>
         <p style="color:rgba(255,255,255,0.8);line-height:1.6">
          Te contactaremos con los detalles de horarios y equipamiento. ¡Bienvenido a la familia azul!</p>`,
      ),
    });
  } catch (e) {
    console.error("Error enviando email de bienvenida:", e);
  }
}
