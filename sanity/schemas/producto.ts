import { defineType, defineField } from "sanity";

export const producto = defineType({
  name: "producto",
  title: "Producto (tienda)",
  type: "document",
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
    }),
    defineField({
      name: "descripcion",
      title: "Descripción",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "precio",
      title: "Precio (CLP)",
      type: "number",
      description: "Entero en pesos chilenos, sin decimales.",
      validation: (r) => r.required().integer().positive(),
    }),
    defineField({
      name: "imagen",
      title: "Imagen",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "categoria",
      title: "Categoría",
      type: "string",
      options: {
        list: [
          { title: "Camisetas", value: "camisetas" },
          { title: "Shorts", value: "shorts" },
          { title: "Medias", value: "medias" },
          { title: "Accesorios", value: "accesorios" },
          { title: "Kits", value: "kits" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "disponible",
      title: "Disponible",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "destacado",
      title: "Destacado (aparece en inicio)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "nuevo",
      title: "Marcar como NUEVO",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "nombre", subtitle: "categoria", media: "imagen" },
  },
});
