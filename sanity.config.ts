"use client";

import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { apiVersion, dataset, projectId } from "./sanity/env";

// El singleton de ajustes se edita como documento único.
const SINGLETONS = ["ajustesSitio"];

const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.listItem()
        .title("Ajustes del sitio")
        .id("ajustesSitio")
        .child(
          S.document().schemaType("ajustesSitio").documentId("ajustesSitio"),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !SINGLETONS.includes(item.getId() ?? ""),
      ),
    ]);

export default defineConfig({
  name: "default",
  title: "Escuela Huachipato Talca",
  projectId,
  dataset,
  basePath: "/studio",
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
