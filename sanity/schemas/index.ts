import { type SchemaTypeDefinition } from "sanity";
import { noticia } from "./noticia";
import { galeria } from "./galeria";
import { categoriaPublica } from "./categoriaPublica";
import { cuerpoTecnico } from "./cuerpoTecnico";
import { producto } from "./producto";
import { ajustesSitio } from "./ajustesSitio";

export const schemaTypes: SchemaTypeDefinition[] = [
  noticia,
  galeria,
  categoriaPublica,
  cuerpoTecnico,
  producto,
  ajustesSitio,
];
