import { reducir, type Accion } from "./reductor";
import { estadoVacio, type EstadoApp } from "./estado";
import { CLAVE_ALMACEN, cargarEstado, guardarEstado, type AlmacenLike } from "./almacen";

// Almacén externo mínimo (sin dependencias) que se lee con useSyncExternalStore.
// Hoy guarda en localStorage. Para conectar una base de datos real, sustituye
// `leerAlmacen` / `escribirAlmacen` por llamadas a tu servicio y conserva la forma de
// `EstadoApp` y `reducir`: ni las pantallas ni el dominio tendrían que cambiar.
export const ESTADO_SERVIDOR: EstadoApp = estadoVacio();

let actual: EstadoApp | null = null;
let errorDeGuardado = false;
let escuchandoOtrasPestanias = false;
const oyentes = new Set<() => void>();

function almacenNavegador(): AlmacenLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function leerAlmacen(): EstadoApp {
  const almacen = almacenNavegador();
  return almacen ? cargarEstado(almacen).estado : estadoVacio();
}

function escribirAlmacen(estado: EstadoApp): void {
  const almacen = almacenNavegador();
  errorDeGuardado = almacen ? !guardarEstado(almacen, estado) : true;
}

function avisar(): void {
  oyentes.forEach((fn) => fn());
}

export function obtenerEstado(): EstadoApp {
  if (actual === null) actual = leerAlmacen();
  return actual;
}

export function despachar(accion: Accion): void {
  const previo = obtenerEstado();
  const siguiente = reducir(previo, accion);
  if (siguiente === previo) return;
  actual = siguiente;
  escribirAlmacen(siguiente);
  avisar();
}

export function guardadoFallo(): boolean {
  return errorDeGuardado;
}

function alCambiarAlmacen(e: StorageEvent): void {
  if (e.key !== CLAVE_ALMACEN && e.key !== null) return;
  actual = null;
  avisar();
}

export function suscribir(fn: () => void): () => void {
  oyentes.add(fn);
  if (!escuchandoOtrasPestanias && typeof window !== "undefined") {
    window.addEventListener("storage", alCambiarAlmacen);
    escuchandoOtrasPestanias = true;
  }
  return () => {
    oyentes.delete(fn);
  };
}

/** Solo para pruebas y para "Borrar todo": fuerza una relectura desde el almacén. */
export function recargarDesdeAlmacen(): void {
  actual = null;
  avisar();
}
