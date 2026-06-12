import { defineType, defineField } from "sanity";

export const noticia = defineType({
  name: "noticia",
  title: "Noticia",
  type: "document",
  fields: [
    defineField({
      name: "titulo",
      title: "Título",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "titulo", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "fecha",
      title: "Fecha de publicación",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "categoria",
      title: "Etiqueta",
      type: "string",
      options: {
        list: [
          { title: "General", value: "general" },
          { title: "Resultados", value: "resultados" },
          { title: "Eventos", value: "eventos" },
          { title: "Comunicados", value: "comunicados" },
        ],
        layout: "radio",
      },
      initialValue: "general",
    }),
    defineField({
      name: "imagen",
      title: "Imagen destacada",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "extracto",
      title: "Extracto",
      type: "text",
      rows: 3,
      description: "Resumen corto para las tarjetas (máx. 200 caracteres).",
      validation: (r) => r.max(200),
    }),
    defineField({
      name: "contenido",
      title: "Contenido",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ],
    }),
  ],
  orderings: [
    {
      title: "Fecha (reciente primero)",
      name: "fechaDesc",
      by: [{ field: "fecha", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "titulo", subtitle: "categoria", media: "imagen" },
  },
});
