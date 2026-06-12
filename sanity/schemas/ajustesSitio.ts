import { defineType, defineField } from "sanity";

export const ajustesSitio = defineType({
  name: "ajustesSitio",
  title: "Ajustes del sitio",
  type: "document",
  // Singleton — gestionado vía structure (un solo documento).
  fields: [
    defineField({
      name: "heroTitulo",
      title: "Título del hero",
      type: "string",
      initialValue: "Escuela de Fútbol Huachipato — Filial Talca",
    }),
    defineField({
      name: "heroSubtitulo",
      title: "Subtítulo del hero",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "telefonoWhatsapp",
      title: "Teléfono WhatsApp",
      type: "string",
      description: "Formato internacional, ej: +56912345678",
    }),
    defineField({
      name: "emailContacto",
      title: "Email de contacto",
      type: "string",
    }),
    defineField({
      name: "datosTransferencia",
      title: "Datos de transferencia (tienda)",
      type: "text",
      rows: 4,
    }),
    defineField({ name: "instagram", title: "Instagram (URL)", type: "url" }),
    defineField({ name: "facebook", title: "Facebook (URL)", type: "url" }),
    defineField({
      name: "horarioEntrenamiento",
      title: "Horario de entrenamiento",
      type: "text",
      rows: 2,
    }),
    defineField({ name: "direccion", title: "Dirección", type: "string" }),
  ],
  preview: { prepare: () => ({ title: "Ajustes del sitio" }) },
});
