import { defineType, defineField } from "sanity";

export const galeria = defineType({
  name: "galeria",
  title: "Álbum de galería",
  type: "document",
  fields: [
    defineField({
      name: "titulo",
      title: "Título del álbum",
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
      title: "Fecha",
      type: "date",
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "portada",
      title: "Foto de portada",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "fotos",
      title: "Fotos",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "caption", title: "Descripción", type: "string" },
          ],
        },
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
    select: { title: "titulo", subtitle: "fecha", media: "portada" },
  },
});
