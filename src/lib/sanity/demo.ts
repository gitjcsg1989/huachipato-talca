// Contenido de ejemplo (modo demo) que se muestra mientras Sanity no esté
// configurado. Cuando se conecta Sanity, el contenido real lo reemplaza.
// Las imágenes reutilizan las fotos del equipo en /public/banner.
import type {
  Noticia,
  AlbumGaleria,
  CategoriaPublica,
  MiembroTecnico,
  Producto,
  AjustesSitio,
} from "./queries";

const IMG = (n: number) => ({ url: `/banner/${n}.png` });

function bloque(texto: string, key: string) {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${key}s`, text: texto, marks: [] }],
  };
}

export const demoNoticias: Noticia[] = [
  {
    _id: "demo-n1",
    titulo: "¡Campeones del torneo apertura Sub-12!",
    slug: "campeones-torneo-apertura-sub-12",
    fecha: "2026-05-28T18:00:00Z",
    categoria: "resultados",
    imagen: IMG(1),
    extracto:
      "Nuestra Sub-12 levantó la copa tras una final cardíaca definida en los penales. ¡Orgullo azul!",
    contenido: [
      bloque(
        "La categoría Sub-12 de la Academia Huachipato Talca se coronó campeona del Torneo Apertura tras vencer en una emocionante final que se definió desde los doce pasos.",
        "b1",
      ),
      bloque(
        "El equipo mostró un fútbol sólido durante todo el campeonato, combinando disciplina táctica y el talento de nuestros jóvenes valores. ¡Felicitaciones a jugadores, cuerpo técnico y apoderados!",
        "b2",
      ),
    ],
  },
  {
    _id: "demo-n2",
    titulo: "Abrimos inscripciones para la temporada 2026",
    slug: "inscripciones-temporada-2026",
    fecha: "2026-05-15T12:00:00Z",
    categoria: "comunicados",
    imagen: IMG(4),
    extracto:
      "Ya puedes inscribir a tu hijo/a en cualquiera de nuestras categorías, desde Sub-6 hasta Sub-16.",
    contenido: [
      bloque(
        "Las inscripciones para la temporada 2026 ya están abiertas. Contamos con categorías desde Sub-6 hasta Sub-16, con entrenadores certificados y un plan de formación integral.",
        "b1",
      ),
      bloque(
        "Completa el formulario en la sección Contacto y nuestro equipo te contactará para coordinar la evaluación y el inicio de los entrenamientos.",
        "b2",
      ),
    ],
  },
  {
    _id: "demo-n3",
    titulo: "Jornada de fútbol formativo en el Estadio Fiscal",
    slug: "jornada-futbol-formativo-estadio-fiscal",
    fecha: "2026-04-30T16:30:00Z",
    categoria: "eventos",
    imagen: IMG(3),
    extracto:
      "Más de 150 niños participaron en una jornada de fútbol y valores junto a sus familias.",
    contenido: [
      bloque(
        "El pasado fin de semana celebramos una jornada de fútbol formativo que reunió a más de 150 niños de todas nuestras categorías junto a sus familias en el Estadio Fiscal de Talca.",
        "b1",
      ),
    ],
  },
];

export const demoAlbumes: AlbumGaleria[] = [
  {
    _id: "demo-a1",
    titulo: "Final Torneo Apertura 2026",
    slug: "final-torneo-apertura-2026",
    fecha: "2026-05-28",
    portada: IMG(1),
    fotos: [
      { ...IMG(1), caption: "Celebración del título" },
      { ...IMG(5), caption: "El equipo en cancha" },
      { ...IMG(3), caption: "Definición del partido" },
    ],
  },
  {
    _id: "demo-a2",
    titulo: "Entrenamientos de pretemporada",
    slug: "entrenamientos-pretemporada",
    fecha: "2026-03-10",
    portada: IMG(2),
    fotos: [
      { ...IMG(2), caption: "Trabajo de velocidad" },
      { ...IMG(4), caption: "Plantel Sub-10" },
    ],
  },
];

export const demoCategoriasPublicas: CategoriaPublica[] = [
  {
    _id: "demo-c1",
    nombre: "Sub-10",
    slug: "sub-10",
    descripcion:
      "Categoría formativa enfocada en fundamentos técnicos, coordinación y juego en equipo.",
    imagen: IMG(4),
    entrenador: "Prof. Rodrigo Salinas",
    horario: "Martes y jueves, 18:00 a 19:30",
    orden: 1,
  },
  {
    _id: "demo-c2",
    nombre: "Sub-12",
    slug: "sub-12",
    descripcion:
      "Profundizamos en táctica, posicionamiento y competencia federada.",
    imagen: IMG(1),
    entrenador: "Prof. Daniela Fuentes",
    horario: "Lunes, miércoles y viernes, 18:30 a 20:00",
    orden: 2,
  },
];

export const demoCuerpoTecnico: MiembroTecnico[] = [
  {
    _id: "demo-t1",
    nombre: "Rodrigo Salinas",
    cargo: "Director Técnico",
    foto: IMG(5),
    descripcion: "Entrenador con más de 10 años en fútbol formativo.",
  },
  {
    _id: "demo-t2",
    nombre: "Daniela Fuentes",
    cargo: "Preparadora Física",
    foto: IMG(2),
    descripcion: "Kinesióloga especialista en deporte infantil.",
  },
  {
    _id: "demo-t3",
    nombre: "Marco Vergara",
    cargo: "Entrenador de Arqueros",
    foto: IMG(3),
    descripcion: "Ex arquero profesional, formador de porteros.",
  },
];

export const demoProductos: Producto[] = [
  {
    _id: "demo-p1",
    nombre: "Camiseta Oficial 2026",
    slug: "camiseta-oficial-2026",
    descripcion: "Camiseta titular azul/negro, tela deportiva transpirable.",
    precio: 24990,
    imagen: IMG(4),
    categoria: "camisetas",
    disponible: true,
    destacado: true,
    nuevo: true,
  },
  {
    _id: "demo-p2",
    nombre: "Short Deportivo",
    slug: "short-deportivo",
    descripcion: "Short negro de entrenamiento, secado rápido.",
    precio: 12990,
    imagen: IMG(2),
    categoria: "shorts",
    disponible: true,
    destacado: true,
  },
  {
    _id: "demo-p3",
    nombre: "Medias Oficiales",
    slug: "medias-oficiales",
    descripcion: "Medias azules con el escudo bordado.",
    precio: 6990,
    imagen: IMG(5),
    categoria: "medias",
    disponible: true,
    destacado: true,
  },
  {
    _id: "demo-p4",
    nombre: "Kit Completo Titular",
    slug: "kit-completo-titular",
    descripcion: "Camiseta + short + medias. Ahorra comprando el kit.",
    precio: 39990,
    imagen: IMG(1),
    categoria: "kits",
    disponible: true,
    destacado: true,
    nuevo: true,
  },
  {
    _id: "demo-p5",
    nombre: "Mochila Deportiva",
    slug: "mochila-deportiva",
    descripcion: "Mochila resistente con compartimento para botines.",
    precio: 18990,
    imagen: IMG(3),
    categoria: "accesorios",
    disponible: true,
  },
  {
    _id: "demo-p6",
    nombre: "Botella Térmica",
    slug: "botella-termica",
    descripcion: "Botella de acero inoxidable 750ml con logo.",
    precio: 9990,
    imagen: IMG(5),
    categoria: "accesorios",
    disponible: true,
  },
];

export const demoAjustes: AjustesSitio = {
  heroTitulo: "Formamos deportistas, forjamos personas",
  heroSubtitulo:
    "La Academia de Fútbol Huachipato en Talca entrena a niños y jóvenes con la disciplina y los valores del club. Inscríbete y sé parte de la familia azul.",
  telefonoWhatsapp: "+56912345678",
  emailContacto: "contacto@academiahuachipato.cl",
  datosTransferencia:
    "Banco Estado\nCuenta Vista 12345678\nAcademia Huachipato Talca\nRUT 76.543.210-9\ncontacto@academiahuachipato.cl",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  horarioEntrenamiento:
    "Lunes a viernes de 18:00 a 20:00\nSábados de 10:00 a 12:00",
  direccion: "Estadio Fiscal, Av. Circunvalación Oriente, Talca",
};
