"use client";

import type { DatosCompartibles } from "./compartir";
import { nunito } from "./fuente";
import { personajePorId, type IdPersonaje } from "./personajes";

// El canvas no lee las variables CSS: usa la familia que next/font asigna a Nunito (la misma de la app).
const FAMILIA = nunito.style.fontFamily;

const ANCHO = 1080;
const ALTO = 1350;

function token(nombre: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
}

function cargar(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function rectRedondeado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function ajustarTexto(ctx: CanvasRenderingContext2D, texto: string, maxAncho: number): string {
  if (ctx.measureText(texto).width <= maxAncho) return texto;
  let t = texto;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxAncho) t = t.slice(0, -1);
  return `${t}…`;
}

/**
 * Imagen 1080×1350 para compartir el carnet: solo la mascota (nombre, especie y raza, foto o personaje)
 * y la marca. Sin peso, vacunas, código, edad ni país. Usa los colores de los tokens.
 */
export async function generarImagenCarnet(
  datos: DatosCompartibles,
  visual: { personaje: IdPersonaje; foto?: string },
): Promise<Blob> {
  await Promise.all([document.fonts.load(`900 80px ${FAMILIA}`), document.fonts.load(`700 36px ${FAMILIA}`)]);
  const c = {
    fondo: token("--color-fondo"),
    papel: token("--color-papel"),
    tinta: token("--color-tinta"),
    suave: token("--color-suave-texto"),
    claro: token("--color-naranja-claro"),
    hondo: token("--color-naranja-hondo"),
  };
  const lienzo = document.createElement("canvas");
  lienzo.width = ANCHO;
  lienzo.height = ALTO;
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
  const fuente = (peso: number, px: number) => `${peso} ${px}px ${FAMILIA}, sans-serif`;

  ctx.fillStyle = c.fondo;
  ctx.fillRect(0, 0, ANCHO, ALTO);

  // Hoja
  const x = 60;
  const y = 60;
  const w = ANCHO - 120;
  const h = ALTO - 120;
  ctx.save();
  ctx.shadowColor = "rgba(112,77,34,0.22)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = c.papel;
  rectRedondeado(ctx, x, y, w, h, 64);
  ctx.fill();
  ctx.restore();

  // Escenario naranja con la mascota
  const escenario = 860;
  const grad = ctx.createLinearGradient(x, y, x + w, y + escenario);
  grad.addColorStop(0, c.claro);
  grad.addColorStop(1, c.hondo);
  ctx.save();
  rectRedondeado(ctx, x, y, w, escenario, 64);
  ctx.clip();
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, escenario);
  ctx.restore();

  ctx.fillStyle = c.tinta;
  ctx.font = fuente(900, 30);
  ctx.fillText("HUELLAS · CARNET", x + 56, y + 84);
  ctx.font = fuente(900, datos.nombre.length > 9 ? 96 : 130);
  ctx.fillText(ajustarTexto(ctx, datos.nombre, w - 112), x + 56, y + 240);
  ctx.font = fuente(700, 36);
  ctx.fillText(ajustarTexto(ctx, datos.linea, w - 112), x + 56, y + 304);

  // Foto o personaje, centrados en el escenario
  const lado = 440;
  const ix = x + (w - lado) / 2;
  const iy = y + escenario - lado - 16;
  if (visual.foto) {
    const foto = await cargar(visual.foto);
    const cx = x + w / 2;
    const cy = iy + lado / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 200, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(foto, cx - 200, cy - 200, 400, 400);
    ctx.restore();
    ctx.lineWidth = 12;
    ctx.strokeStyle = c.papel;
    ctx.beginPath();
    ctx.arc(cx, cy, 200, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    const avatar = await cargar(personajePorId(visual.personaje).imagen);
    ctx.drawImage(avatar, ix, iy, lado, lado);
  }

  // Pie de marca
  ctx.fillStyle = c.tinta;
  ctx.font = fuente(900, 64);
  ctx.fillText("Huellas", x + 56, y + escenario + 120);
  ctx.fillStyle = c.suave;
  ctx.font = fuente(700, 32);
  ctx.fillText("Carnet de salud digital para perros y gatos", x + 56, y + escenario + 176);
  ctx.font = fuente(700, 28);
  ctx.fillText("Información anotada por su tutor. No reemplaza a un veterinario.", x + 56, y + h - 74);

  return new Promise((resolve, reject) =>
    lienzo.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen"))), "image/png"),
  );
}
