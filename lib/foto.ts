"use client";

const LIMITE_CARACTERES = 190_000;

export type ResultadoFoto = { ok: true; foto: string } | { ok: false; error: string };

/**
 * Reduce una foto hasta que su lado mayor mida `lado` px, conservando la proporción completa de la imagen:
 * no se recorta nada (así no se pierden orejas, cabeza ni patas). Se devuelve como JPEG en base64.
 * Todo ocurre en el navegador.
 */
export async function reducirFoto(archivo: File, lado = 480): Promise<ResultadoFoto> {
  if (!archivo.type.startsWith("image/")) return { ok: false, error: "Elige una imagen (JPG, PNG o WebP)." };
  try {
    const bitmap = await createImageBitmap(archivo);
    const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height));
    const anchoDestino = Math.max(1, Math.round(bitmap.width * escala));
    const altoDestino = Math.max(1, Math.round(bitmap.height * escala));
    const lienzo = document.createElement("canvas");
    lienzo.width = anchoDestino;
    lienzo.height = altoDestino;
    const ctx = lienzo.getContext("2d");
    if (!ctx) return { ok: false, error: "Tu navegador no puede procesar la foto." };
    // Fondo blanco: el JPEG no tiene transparencia y así una imagen PNG transparente no se ve negra.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, anchoDestino, altoDestino);
    ctx.drawImage(bitmap, 0, 0, anchoDestino, altoDestino);
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
