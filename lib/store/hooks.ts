"use client";

import { useCallback, useSyncExternalStore } from "react";
import { hoyISO, type FechaISO } from "../fechas";
import { mascotaActiva } from "./selectores";
import { despachar, ESTADO_SERVIDOR, obtenerEstado, suscribir } from "./store";
import type { EstadoApp } from "./estado";
import type { Mascota } from "../mascota";
import type { Accion } from "./reductor";

const sinSuscripcion = () => () => {};

export interface Huellas {
  estado: EstadoApp;
  /** Falso durante el render del servidor y la hidratación: muestra esqueletos, no datos. */
  listo: boolean;
  /** Fecha de hoy ("" mientras `listo` sea falso). */
  hoy: FechaISO;
  mascota: Mascota | undefined;
  despachar: (accion: Accion) => void;
}

export function useHuellas(): Huellas {
  const estado = useSyncExternalStore(suscribir, obtenerEstado, () => ESTADO_SERVIDOR);
  const listo = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const hoy = listo ? hoyISO() : "";
  const accion = useCallback((a: Accion) => despachar(a), []);
  return { estado, listo, hoy, mascota: mascotaActiva(estado), despachar: accion };
}

/** Id con UUID completo (122 bits de azar). El código del carnet sale de este id: no debe ser corto. */
export function nuevoId(prefijo: string): string {
  const azar =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join("");
  return `${prefijo}-${Date.now().toString(36)}-${azar}`;
}
