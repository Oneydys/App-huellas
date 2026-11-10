import { estadoSchema, estadoVacio, VERSION_ESTADO, type EstadoApp } from "./estado";

type Crudo = Record<string, unknown>;

/**
 * Cada migración lleva el estado de la versión N a la N+1. Al cambiar la forma de los datos:
 * sube VERSION_ESTADO, agrega aquí la migración y una prueba. Nunca edites una anterior.
 */
const MIGRACIONES: Record<number, (estado: Crudo) => Crudo> = {
  // v0 → v1: formato sin versión; completa los campos que faltaban.
  0: (e) => ({
    ...estadoVacio(),
    ...e,
    version: 1,
    mascotas: Array.isArray(e.mascotas) ? e.mascotas : [],
    registros: Array.isArray(e.registros) ? e.registros : [],
    cuidados: Array.isArray(e.cuidados) ? e.cuidados : [],
  }),
};

export type ResultadoMigracion = { ok: true; estado: EstadoApp } | { ok: false; motivo: string };

export function migrarEstado(crudo: unknown): ResultadoMigracion {
  if (typeof crudo !== "object" || crudo === null || Array.isArray(crudo)) {
    return { ok: false, motivo: "Los datos guardados no tienen el formato esperado." };
  }
  let actual = crudo as Crudo;
  let version = typeof actual.version === "number" ? actual.version : 0;
  if (version > VERSION_ESTADO) {
    return { ok: false, motivo: "Los datos vienen de una versión más nueva de la app." };
  }
  while (version < VERSION_ESTADO) {
    const paso = MIGRACIONES[version];
    if (!paso) return { ok: false, motivo: `No hay migración desde la versión ${version}.` };
    actual = paso(actual);
    version += 1;
  }
  const r = estadoSchema.safeParse(actual);
  if (!r.success) {
    return { ok: false, motivo: "Algunos datos guardados no son válidos." };
  }
  return { ok: true, estado: r.data };
}
