import type { FechaISO } from "./fechas";
import type { Registro, RegistroDe, TipoActividad } from "./registros";

/** Resumen de la actividad de un día. Solo cuenta registros reales o de demostración de esa mascota; nunca los inventa. */
export interface ResumenActividad {
  fecha: FechaISO;
  minutos: number;
  cantidad: number;
  /** Solo existe si al menos un paseo del día tiene distancia registrada. */
  distanciaKm?: number;
  porTipo: Record<TipoActividad, number>;
}

export type RegistroActividad = RegistroDe<"actividad">;

function esActividadDeMascota(r: Registro, mascotaId: string): r is RegistroActividad {
  return r.tipo === "actividad" && r.mascotaId === mascotaId;
}

function resumirDia(registros: readonly RegistroActividad[], fecha: FechaISO): ResumenActividad {
  const porTipo: Record<TipoActividad, number> = { paseo: 0, juego: 0, ejercicio: 0 };
  let minutos = 0;
  let distancia: number | undefined;
  for (const r of registros) {
    minutos += r.minutos;
    porTipo[r.tipoActividad] += r.minutos;
    if (r.tipoActividad === "paseo" && r.distanciaKm !== undefined) {
      distancia = (distancia ?? 0) + r.distanciaKm;
    }
  }
  return {
    fecha,
    minutos,
    cantidad: registros.length,
    ...(distancia !== undefined ? { distanciaKm: Math.round(distancia * 100) / 100 } : {}),
    porTipo,
  };
}

/** Actividad registrada de una mascota en un día concreto. */
export function actividadDelDia(registros: readonly Registro[], mascotaId: string, fecha: FechaISO): ResumenActividad {
  const del = registros.filter((r): r is RegistroActividad => esActividadDeMascota(r, mascotaId) && r.fecha === fecha);
  return resumirDia(del, fecha);
}

/** Progreso hacia el objetivo diario, entre 0 y 1 (sin pasarse de 100 %). */
export function progresoObjetivo(minutos: number, objetivo: number): number {
  if (objetivo <= 0) return 0;
  return Math.min(1, Math.max(0, minutos / objetivo));
}

/** Días con actividad de una mascota, del más reciente al más antiguo. */
export function historialActividad(registros: readonly Registro[], mascotaId: string): ResumenActividad[] {
  const propios = registros.filter((r): r is RegistroActividad => esActividadDeMascota(r, mascotaId));
  const fechas = [...new Set(propios.map((r) => r.fecha))].sort().reverse();
  return fechas.map((fecha) => resumirDia(propios.filter((r) => r.fecha === fecha), fecha));
}
