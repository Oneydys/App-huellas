import { crearCuidado, type CuidadoProgramado } from "./cuidados";
import { sumarDias, sumarMeses, type FechaISO } from "./fechas";
import type { Mascota } from "./mascota";
import { registroSchema, type Registro } from "./registros";

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
    nombre: "Luna",
    especie: "gato",
    personaje: "europeo",
    nacimiento: sumarMeses(hoy, -50),
    nacimientoAproximado: true,
    raza: "Europeo",
    pais: "CO",
    prioridad: "desparasitacion",
    creadaEn: hoy,
    origen: "demo",
  };
  const max: Mascota = {
    id: `${PREFIJO_DEMO}max`,
    nombre: "Max",
    especie: "perro",
    personaje: "beagle",
    nacimiento: sumarMeses(hoy, -8),
    nacimientoAproximado: true,
    raza: "Beagle",
    pais: "MX",
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

  return { mascotas: [luna, max], registros, cuidados };
}

export function esDemoId(id: string): boolean {
  return id.startsWith(PREFIJO_DEMO);
}
