import { groq } from "next-sanity";
import { sanityClient, sanityConfigurado } from "./client";

// ── Tipos de los documentos devueltos ──
export interface SanityImagen {
  asset?: { _ref: string };
  hotspot?: { x: number; y: number };
  caption?: string;
  /** Solo en modo demo: URL local directa (sin pasar por Sanity). */
  url?: string;
}

export interface Noticia {
  _id: string;
  titulo: string;
  slug: string;
  fecha: string;
  categoria?: string;
  imagen?: SanityImagen;
  extracto?: string;
  contenido?: unknown[];
}

export interface AlbumGaleria {
  _id: string;
  titulo: string;
  slug: string;
  fecha: string;
  portada?: SanityImagen;
  fotos?: SanityImagen[];
}

export interface CategoriaPublica {
  _id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagen?: SanityImagen;
  entrenador?: string;
  horario?: string;
  orden?: number;
}

export interface MiembroTecnico {
  _id: string;
  nombre: string;
  cargo: string;
  foto?: SanityImagen;
  descripcion?: string;
}

export interface Producto {
  _id: string;
  nombre: string;
  slug?: string;
  descripcion?: string;
  precio: number;
  imagen?: SanityImagen;
  categoria: string;
  disponible: boolean;
  destacado?: boolean;
  nuevo?: boolean;
}

export interface AjustesSitio {
  heroTitulo?: string;
  heroSubtitulo?: string;
  telefonoWhatsapp?: string;
  emailContacto?: string;
  datosTransferencia?: string;
  instagram?: string;
  facebook?: string;
  horarioEntrenamiento?: string;
  direccion?: string;
}

// ── GROQ ──
const camposNoticia = `
  _id, titulo, "slug": slug.current, fecha, categoria, imagen, extracto
`;

export const QUERY_NOTICIAS_RECIENTES = groq`
  *[_type == "noticia"] | order(fecha desc)[0...$limite]{ ${camposNoticia} }
`;

export const QUERY_NOTICIAS_PAGINA = groq`
  *[_type == "noticia"] | order(fecha desc)[$desde...$hasta]{ ${camposNoticia} }
`;

export const QUERY_TOTAL_NOTICIAS = groq`count(*[_type == "noticia"])`;

export const QUERY_NOTICIA_SLUG = groq`
  *[_type == "noticia" && slug.current == $slug][0]{
    ${camposNoticia}, contenido
  }
`;

export const QUERY_ALBUMES = groq`
  *[_type == "galeria"] | order(fecha desc){
    _id, titulo, "slug": slug.current, fecha, portada, fotos
  }
`;

export const QUERY_CATEGORIAS_PUBLICAS = groq`
  *[_type == "categoriaPublica"] | order(orden asc){
    _id, nombre, "slug": slug.current, descripcion, imagen, entrenador, horario, orden
  }
`;

export const QUERY_CATEGORIA_PUBLICA_SLUG = groq`
  *[_type == "categoriaPublica" && slug.current == $slug][0]{
    _id, nombre, "slug": slug.current, descripcion, imagen, entrenador, horario
  }
`;

export const QUERY_CUERPO_TECNICO = groq`
  *[_type == "cuerpoTecnico"] | order(orden asc){
    _id, nombre, cargo, foto, descripcion
  }
`;

const camposProducto = `
  _id, nombre, "slug": slug.current, descripcion, precio, imagen,
  categoria, disponible, destacado, nuevo
`;

export const QUERY_PRODUCTOS = groq`
  *[_type == "producto" && disponible == true] | order(nombre asc){ ${camposProducto} }
`;

export const QUERY_PRODUCTOS_DESTACADOS = groq`
  *[_type == "producto" && disponible == true && destacado == true]
    | order(nombre asc)[0...$limite]{ ${camposProducto} }
`;

export const QUERY_AJUSTES = groq`*[_type == "ajustesSitio"][0]`;

// ── Fetch helpers seguros (devuelven fallback si Sanity no está configurado) ──
type FetchOpts = { tags?: string[]; revalidate?: number };

async function fetchSeguro<T>(
  query: string,
  params: Record<string, unknown> = {},
  fallback: T,
  opts: FetchOpts = {},
): Promise<T> {
  if (!sanityConfigurado) return fallback;
  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate: opts.revalidate ?? 3600, tags: opts.tags },
    });
  } catch (e) {
    console.error("Error consultando Sanity:", e);
    return fallback;
  }
}

// Datos demo: se usan como fallback mientras Sanity no esté configurado.
import {
  demoNoticias,
  demoAlbumes,
  demoCategoriasPublicas,
  demoCuerpoTecnico,
  demoProductos,
  demoAjustes,
} from "./demo";

export const getNoticiasRecientes = (limite = 3) =>
  fetchSeguro<Noticia[]>(
    QUERY_NOTICIAS_RECIENTES,
    { limite },
    demoNoticias.slice(0, limite),
    { tags: ["noticia"] },
  );

export const getNoticiasPagina = (desde: number, hasta: number) =>
  fetchSeguro<Noticia[]>(
    QUERY_NOTICIAS_PAGINA,
    { desde, hasta },
    demoNoticias.slice(desde, hasta),
    { tags: ["noticia"] },
  );

export const getTotalNoticias = () =>
  fetchSeguro<number>(QUERY_TOTAL_NOTICIAS, {}, demoNoticias.length, {
    tags: ["noticia"],
  });

export const getNoticiaPorSlug = (slug: string) =>
  fetchSeguro<Noticia | null>(
    QUERY_NOTICIA_SLUG,
    { slug },
    demoNoticias.find((n) => n.slug === slug) ?? null,
    { tags: ["noticia"] },
  );

export const getAlbumes = () =>
  fetchSeguro<AlbumGaleria[]>(QUERY_ALBUMES, {}, demoAlbumes, {
    tags: ["galeria"],
  });

export const getCategoriasPublicas = () =>
  fetchSeguro<CategoriaPublica[]>(
    QUERY_CATEGORIAS_PUBLICAS,
    {},
    demoCategoriasPublicas,
    { tags: ["categoriaPublica"] },
  );

export const getCategoriaPublicaPorSlug = (slug: string) =>
  fetchSeguro<CategoriaPublica | null>(
    QUERY_CATEGORIA_PUBLICA_SLUG,
    { slug },
    demoCategoriasPublicas.find((c) => c.slug === slug) ?? null,
    { tags: ["categoriaPublica"] },
  );

export const getCuerpoTecnico = () =>
  fetchSeguro<MiembroTecnico[]>(QUERY_CUERPO_TECNICO, {}, demoCuerpoTecnico, {
    tags: ["cuerpoTecnico"],
  });

export const getProductos = () =>
  fetchSeguro<Producto[]>(QUERY_PRODUCTOS, {}, demoProductos, {
    tags: ["producto"],
  });

export const getProductosDestacados = (limite = 4) =>
  fetchSeguro<Producto[]>(
    QUERY_PRODUCTOS_DESTACADOS,
    { limite },
    demoProductos.filter((p) => p.destacado).slice(0, limite),
    { tags: ["producto"] },
  );

export const getAjustes = () =>
  fetchSeguro<AjustesSitio | null>(QUERY_AJUSTES, {}, demoAjustes, {
    tags: ["ajustesSitio"],
  });
