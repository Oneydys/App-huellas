import type { PropuestaCuidado } from "./calendario-vivo";
import type { FechaISO } from "./fechas";

/**
 * Datos del registro que se crea al tocar "Hecho hoy" en el calendario. Solo hay uno cuando
 * no hace falta preguntar nada más; para peso y medicamento devuelve `null` y la app abre el
 * formulario. No inventa productos ni dosis: lo que no se sabe queda sin especificar.
 */
export function datosDeHechoRapido(
  p: PropuestaCuidado,
  mascotaId: string,
  hoy: FechaISO,
): Record<string, unknown> | null {
  const propio = p.cuidadoId !== undefined; // la persona le puso su propio título
  const comun = { mascotaId, fecha: hoy, nota: "Marcado como hecho desde el calendario." };
  switch (p.categoria) {
    case "vacuna":
      return { ...comun, tipo: "vacuna", nombre: propio ? p.titulo : "Vacuna" };
    case "desparasitacion":
      return { ...comun, tipo: "desparasitacion", via: "sin-especificar" };
    case "visita":
      return { ...comun, tipo: "visita", motivo: propio ? p.titulo : "Revisión veterinaria" };
    case "peso":
    case "medicamento":
      return null;
  }
}
