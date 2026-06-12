// Hace transparente el fondo gris/blanco del logo (flood-fill desde los bordes).
// Uso: node scripts/transparent-logo.mjs
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SRC = "public/logo-huachipato.webp";
const OUT = "public/logo-huachipato.png";
const ICON = "src/app/icon.png";

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info; // channels = 4
const px = (x, y) => (y * width + x) * channels;

// Color de fondo: promedio de las 4 esquinas
const corners = [
  [0, 0],
  [width - 1, 0],
  [0, height - 1],
  [width - 1, height - 1],
];
let br = 0,
  bg = 0,
  bb = 0;
for (const [x, y] of corners) {
  const i = px(x, y);
  br += data[i];
  bg += data[i + 1];
  bb += data[i + 2];
}
br /= 4;
bg /= 4;
bb /= 4;

const TOL = 38; // tolerancia de color
const cerca = (i) =>
  Math.abs(data[i] - br) < TOL &&
  Math.abs(data[i + 1] - bg) < TOL &&
  Math.abs(data[i + 2] - bb) < TOL;

// BFS desde todos los píxeles del borde
const visit = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) {
  stack.push([x, 0], [x, height - 1]);
}
for (let y = 0; y < height; y++) {
  stack.push([0, y], [width - 1, y]);
}

let removed = 0;
while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const idx = y * width + x;
  if (visit[idx]) continue;
  const i = idx * channels;
  if (!cerca(i)) continue;
  visit[idx] = 1;
  data[i + 3] = 0; // alpha = 0
  removed++;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

const png = await sharp(data, { raw: { width, height, channels } })
  .png()
  .toBuffer();
writeFileSync(OUT, png);

// Favicon (256x256) con leve padding
const icon = await sharp(data, { raw: { width, height, channels } })
  .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
writeFileSync(ICON, icon);

console.log(
  `OK — ${removed} píxeles de fondo → transparente. bg≈rgb(${br | 0},${bg | 0},${bb | 0})`,
);
console.log(`Escrito: ${OUT} y ${ICON}`);
