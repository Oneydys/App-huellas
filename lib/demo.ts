import { crearCuidado, type CuidadoProgramado } from "./cuidados";
import { sumarDias, sumarMeses, type FechaISO } from "./fechas";
import type { Mascota } from "./mascota";
import { registroSchema, type Registro } from "./registros";
import { FOTO_DEMO_MILO, FOTO_DEMO_TOBY } from "./demo-foto";

export const PREFIJO_DEMO = "demo-";

export interface DatosDemo {
  mascotas: Mascota[];
  registros: Registro[];
  cuidados: CuidadoProgramado[];
}

/**
 * Datos de demostración (dos mascotas inventadas). Todo lleva `origen: "demo"` y un id con
 * prefijo `demo-`, así se pueden quitar sin tocar los datos reales. Las fechas son relativas
 * a `hoy` para que el calendario siempre se vea vivo.
 */
export function crearDemo(hoy: FechaISO): DatosDemo {
  const luna: Mascota = {
    id: `${PREFIJO_DEMO}luna`,
    nombre: "Milo",
    foto: FOTO_DEMO_MILO,
    especie: "gato",
    personaje: "europeo",
    dije: "Huella turquesa",
    nacimiento: sumarMeses(hoy, -36),
    nacimientoAproximado: true,
    raza: "",
    pais: "PE",
    prioridad: "desparasitacion",
    creadaEn: hoy,
    origen: "demo",
  };
  const max: Mascota = {
    id: `${PREFIJO_DEMO}max`,
    nombre: "Toby",
    foto: FOTO_DEMO_TOBY,
    dije: "",
    especie: "perro",
    personaje: "beagle",
    nacimiento: sumarMeses(hoy, -24),
    nacimientoAproximado: true,
    raza: "Golden Retriever",
    pais: "CO",
    prioridad: "vacuna",
    creadaEn: hoy,
    origen: "demo",
  };

  const reg = (datos: Record<string, unknown>): Registro =>
    registroSchema.parse({ origen: "demo", ...datos });

  const registros: Registro[] = [
    reg({ id: "demo-r1", mascotaId: luna.id, tipo: "vacuna", fecha: sumarDias(hoy, -300), nombre: "Vacuna múltiple" }),
    reg({ id: "demo-r2", mascotaId: luna.id, tipo: "desparasitacion", fecha: sumarDias(hoy, -78), via: "interna" }),
    reg({ id: "demo-r3", mascotaId: luna.id, tipo: "peso", fecha: sumarDias(hoy, -100), kg: 4.3 }),
    reg({ id: "demo-r4", mascotaId: luna.id, tipo: "peso", fecha: sumarDias(hoy, -45), kg: 4.4 }),
    reg({ id: "demo-r5", mascotaId: luna.id, tipo: "peso", fecha: sumarDias(hoy, -3), kg: 4.5 }),
    reg({ id: "demo-r6", mascotaId: luna.id, tipo: "visita", fecha: sumarDias(hoy, -300), motivo: "Control anual (ejemplo)" }),
    reg({ id: "demo-r7", mascotaId: luna.id, tipo: "observacion", fecha: sumarDias(hoy, -12), texto: "Ejemplo: está jugando más por las tardes." }),
    reg({
      id: "demo-r8",
      mascotaId: max.id,
      tipo: "vacuna",
      fecha: sumarDias(hoy, -20),
      nombre: "Dosis del esquema de cachorro (ejemplo)",
      proximaFecha: sumarDias(hoy, 8),
    }),
    reg({ id: "demo-r9", mascotaId: max.id, tipo: "desparasitacion", fecha: sumarDias(hoy, -25), via: "ambas" }),
    reg({ id: "demo-r10", mascotaId: max.id, tipo: "peso", fecha: sumarDias(hoy, -30), kg: 6.2 }),
    reg({ id: "demo-r11", mascotaId: max.id, tipo: "peso", fecha: sumarDias(hoy, -2), kg: 7.4 }),
    reg({
      id: "demo-r12",
      mascotaId: max.id,
      tipo: "medicamento",
      fecha: sumarDias(hoy, -3),
      nombre: "Tratamiento de ejemplo",
      dosis: "Según indicación del veterinario",
      fin: sumarDias(hoy, 4),
    }),
  ];

  const programado = crearCuidado(
    {
      mascotaId: luna.id,
      categoria: "visita",
      titulo: "Limpieza dental (ejemplo)",
      fecha: sumarDias(hoy, 10),
      origen: "demo",
    },
    { id: "demo-c1", hoy },
  );
  const cuidados = programado.ok ? [programado.cuidado] : [];

  // Actividad de demostración: separada de los registros reales por origen "demo" y su id.
  const actividades: Registro[] = [
    reg({ id: "demo-a1", mascotaId: max.id, tipo: "actividad", tipoActividad: "paseo", minutos: 35, distanciaKm: 2.1, fecha: hoy }),
    reg({ id: "demo-a2", mascotaId: max.id, tipo: "actividad", tipoActividad: "paseo", minutos: 40, distanciaKm: 2.8, fecha: sumarDias(hoy, -1) }),
    reg({ id: "demo-a3", mascotaId: max.id, tipo: "actividad", tipoActividad: "ejercicio", minutos: 20, fecha: sumarDias(hoy, -2) }),
    reg({ id: "demo-a4", mascotaId: max.id, tipo: "actividad", tipoActividad: "juego", minutos: 10, fecha: sumarDias(hoy, -5) }),
    reg({ id: "demo-a5", mascotaId: luna.id, tipo: "actividad", tipoActividad: "juego", minutos: 15, fecha: hoy }),
    reg({ id: "demo-a6", mascotaId: luna.id, tipo: "actividad", tipoActividad: "juego", minutos: 10, fecha: sumarDias(hoy, -1) }),
    reg({ id: "demo-a7", mascotaId: luna.id, tipo: "actividad", tipoActividad: "juego", minutos: 20, fecha: sumarDias(hoy, -4) }),
  ];

  return { mascotas: [luna, max], registros: [...registros, ...actividades], cuidados };
}

export function esDemoId(id: string): boolean {
  return id.startsWith(PREFIJO_DEMO);
}
