import { defineType, defineField } from "sanity";

export const categoriaPublica = defineType({
  name: "categoriaPublica",
  title: "Categoría (contenido público)",
  type: "document",
  description:
    "Contenido editorial de cada categoría. El slug debe coincidir con la categoría en la base de datos.",
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "nombre", maxLength: 96 },
      description: 'Debe coincidir con la categoría en Supabase (ej: "sub-10").',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "descripcion",
      title: "Descripción",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "imagen",
      title: "Imagen",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "entrenador",
      title: "Entrenador a cargo",
      type: "string",
    }),
    defineField({
      name: "horario",
      title: "Horario de entrenamiento",
      type: "string",
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
    select: { title: "nombre", subtitle: "entrenador", media: "imagen" },
  },
});
