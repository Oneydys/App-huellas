// Ayudas para las imágenes que genera next/og (tarjeta de la huella y vista previa de enlaces).
// next/og solo lee TTF, OTF o WOFF: las fuentes son copias WOFF estáticas de Nunito (OFL, ver app/_og).
// Solo se usan desde rutas del servidor. Las rutas declaran estos archivos en next.config.ts (outputFileTracingIncludes).
import { readFile } from "node:fs/promises";
import path from "node:path";

/** Lee un archivo de app/_og (ruta fija en el código, así Next solo empaqueta esa carpeta). */
export async function leerFuente(nombre: string): Promise<ArrayBuffer> {
  return bytesDe(path.join(process.cwd(), "app", "_og", nombre));
}

/** Lee el personaje de marca de public/images. */
export async function leerMascota(): Promise<ArrayBuffer> {
  return bytesDe(path.join(process.cwd(), "public", "images", "huellas-mascot.png"));
}

/** Emblema de marca (aro y pata, sin texto) de public/images. */
export async function leerEmblema(): Promise<ArrayBuffer> {
  return bytesDe(path.join(process.cwd(), "public", "images", "peluvet-emblema.png"));
}

async function bytesDe(ruta: string): Promise<ArrayBuffer> {
  const bytes = await readFile(ruta);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/** Fuentes Nunito 700 y 900 para ImageResponse. */
export function fuentesOg(f700: ArrayBuffer, f900: ArrayBuffer) {
  return [
    { name: "Nunito", data: f700, weight: 700 as const, style: "normal" as const },
    { name: "Nunito", data: f900, weight: 900 as const, style: "normal" as const },
  ];
}

/** Personaje de marca (no es la mascota de nadie) como imagen embebida. */
export function mascotaOg(png: ArrayBuffer): string {
  return `data:image/png;base64,${Buffer.from(png).toString("base64")}`;
}

/** Colores de la identidad para las imágenes (los mismos tokens de app/globals.css). */
export const COLOR_OG = {
  fondo: "#ffe0c8",
  papel: "#fffdfb",
  hundido: "#fff0d9",
  tinta: "#241d45",
  suave: "#6b6779",
  naranjaClaro: "#ffb536",
  naranjaHondo: "#ff9619",
  naranja: "#ffa51f",
} as const;
