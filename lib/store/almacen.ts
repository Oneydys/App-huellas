import { hoyISO } from "../fechas";
import { estadoVacio, VERSION_ESTADO, type EstadoApp } from "./estado";
import { migrarEstado } from "./migraciones";

export const CLAVE_ALMACEN = "huellas:estado";
export const CLAVE_RESPALDO_CORRUPTO = "huellas:estado:corrupto";

/** Subconjunto de `Storage`: permite probar con una implementación en memoria. */
export interface AlmacenLike {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
  removeItem(clave: string): void;
}

export type EstadoDeCarga = "vacio" | "ok" | "recuperado-con-respaldo";

/** Quita registros y cuidados que apuntan a una mascota que ya no existe. */
export function sanear(estado: EstadoApp): EstadoApp {
  const ids = new Set(estado.mascotas.map((m) => m.id));
  const activa = estado.mascotaActivaId && ids.has(estado.mascotaActivaId) ? estado.mascotaActivaId : (estado.mascotas[0]?.id ?? null);
  return {
    ...estado,
    registros: estado.registros.filter((r) => ids.has(r.mascotaId)),
    cuidados: estado.cuidados.filter((c) => ids.has(c.mascotaId)),
    mascotaActivaId: activa,
  };
}

export function cargarEstado(almacen: AlmacenLike): { estado: EstadoApp; resultado: EstadoDeCarga } {
  let texto: string | null = null;
  try {
    texto = almacen.getItem(CLAVE_ALMACEN);
  } catch {
    return { estado: estadoVacio(), resultado: "vacio" };
  }
  if (texto === null) return { estado: estadoVacio(), resultado: "vacio" };

  let crudo: unknown;
  try {
    crudo = JSON.parse(texto);
  } catch {
    crudo = undefined;
  }
  const migrado = migrarEstado(crudo);
  if (migrado.ok) return { estado: sanear(migrado.estado), resultado: "ok" };

  // Datos ilegibles: se conserva una copia antes de empezar de cero, para no perder nada en silencio.
  try {
    almacen.setItem(CLAVE_RESPALDO_CORRUPTO, texto);
  } catch {
    /* sin espacio: seguimos igual */
  }
  return { estado: estadoVacio(), resultado: "recuperado-con-respaldo" };
}

export function guardarEstado(almacen: AlmacenLike, estado: EstadoApp): boolean {
  try {
    almacen.setItem(CLAVE_ALMACEN, JSON.stringify(estado));
    return true;
  } catch {
    return false;
  }
}

export function borrarEstado(almacen: AlmacenLike): void {
  try {
    almacen.removeItem(CLAVE_ALMACEN);
  } catch {
    /* nada que borrar */
  }
}

const FORMATO_COPIA = "huellas-copia";

/** Copia de seguridad en JSON. Exportar nunca depende del plan. */
export function exportarJSON(estado: EstadoApp, ahora: Date = new Date()): string {
  return JSON.stringify(
    { formato: FORMATO_COPIA, version: VERSION_ESTADO, exportadoEn: ahora.toISOString(), estado },
    null,
    2,
  );
}

export function nombreArchivoCopia(ahora: Date = new Date()): string {
  return `huellas-copia-${hoyISO(ahora)}.json`;
}

export type ResultadoImportacion = { ok: true; estado: EstadoApp } | { ok: false; error: string };

export function importarJSON(texto: string): ResultadoImportacion {
  let crudo: unknown;
  try {
    crudo = JSON.parse(texto);
  } catch {
    return { ok: false, error: "El archivo no es una copia válida de Peluvet." };
  }
  const esCopia =
    typeof crudo === "object" && crudo !== null && (crudo as Record<string, unknown>).formato === FORMATO_COPIA;
  const contenido = esCopia ? (crudo as Record<string, unknown>).estado : crudo;
  const migrado = migrarEstado(contenido);
  if (!migrado.ok) return { ok: false, error: migrado.motivo };
  return { ok: true, estado: sanear(migrado.estado) };
}

