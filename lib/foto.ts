"use client";

const LIMITE_CARACTERES = 190_000;

export type ResultadoFoto = { ok: true; foto: string } | { ok: false; error: string };

/** Reduce una foto a un cuadrado de hasta 480 px y la devuelve como JPEG en base64. Todo ocurre en el navegador. */
export async function reducirFoto(archivo: File, lado = 480): Promise<ResultadoFoto> {
  if (!archivo.type.startsWith("image/")) return { ok: false, error: "Elige una imagen (JPG, PNG o WebP)." };
  try {
    const bitmap = await createImageBitmap(archivo);
    const corte = Math.min(bitmap.width, bitmap.height);
    const lienzo = document.createElement("canvas");
    const destino = Math.min(lado, corte);
    lienzo.width = destino;
    lienzo.height = destino;
    const ctx = lienzo.getContext("2d");
    if (!ctx) return { ok: false, error: "Tu navegador no puede procesar la foto." };
    ctx.drawImage(bitmap, (bitmap.width - corte) / 2, (bitmap.height - corte) / 2, corte, corte, 0, 0, destino, destino);
    bitmap.close();
    for (const calidad of [0.82, 0.7, 0.55, 0.4]) {
      const url = lienzo.toDataURL("image/jpeg", calidad);
      if (url.length <= LIMITE_CARACTERES) return { ok: true, foto: url };
    }
    return { ok: false, error: "La foto es demasiado pesada. Prueba con otra." };
  } catch {
    return { ok: false, error: "No pudimos leer esa foto. Prueba con otra." };
  }
}
