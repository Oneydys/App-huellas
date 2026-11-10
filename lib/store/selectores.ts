import { limiteDeMascotas, PLANTILLA } from "../plantilla";
import { diasEntre, type FechaISO } from "../fechas";
import type { Mascota } from "../mascota";
import type { EstadoApp, Plan } from "./estado";

export function mascotaActiva(estado: EstadoApp): Mascota | undefined {
  return estado.mascotas.find((m) => m.id === estado.mascotaActivaId) ?? estado.mascotas[0];
}

export function hayDatosDemo(estado: EstadoApp): boolean {
  return estado.mascotas.some((m) => m.origen === "demo");
}

/** Mascotas propias (las de demostración no cuentan contra el límite del plan). */
export function mascotasPropias(estado: EstadoApp): Mascota[] {
  return estado.mascotas.filter((m) => m.origen === "usuario");
}

/**
 * Plan que aplica hoy. La prueba simulada vence a los `diasPrueba` días y vuelve al plan gratis:
 * sus datos se conservan, solo cambia el límite de mascotas propias.
 */
export function planVigente(estado: EstadoApp, hoy: FechaISO): Plan {
  if (estado.plan !== "prueba-simulada") return "gratis";
  if (!estado.pruebaIniciadaEn) return "prueba-simulada";
  return diasEntre(estado.pruebaIniciadaEn, hoy) < PLANTILLA.precios.diasPrueba ? "prueba-simulada" : "gratis";
}

export function puedeAgregarMascota(estado: EstadoApp, hoy: FechaISO): boolean {
  return mascotasPropias(estado).length < limiteDeMascotas(planVigente(estado, hoy));
}
