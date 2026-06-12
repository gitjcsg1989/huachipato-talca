import { defineType, defineField } from "sanity";

export const cuerpoTecnico = defineType({
  name: "cuerpoTecnico",
  title: "Cuerpo técnico",
  type: "document",
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre completo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "cargo",
      title: "Cargo",
      type: "string",
      description: 'Ej: "Director técnico", "Preparador físico"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "foto",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "descripcion",
      title: "Descripción",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "orden",
      title: "Orden de aparición",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Orden",
      name: "ordenAsc",
      by: [{ field: "orden", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "nombre", subtitle: "cargo", media: "foto" },
  },
});
