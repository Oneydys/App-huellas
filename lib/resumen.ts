import { formatearFecha, hoyISO, type FechaISO } from "./fechas";
import { describirEdad, razaOMestizo, type Mascota } from "./mascota";
import { nombreDePais } from "./paises";
import { ETIQUETA_ESPECIE } from "./personajes";
import { PLANTILLA } from "./plantilla";
import {
  detalleRegistro,
  formatearKg,
  ordenarRecientes,
  pesoActual,
  registrosDe,
  tituloRegistro,
  type Registro,
  type TipoRegistro,
} from "./registros";

export interface SeccionResumen {
  tipo: TipoRegistro | "datos";
  titulo: string;
  lineas: string[];
}

export interface ResumenVeterinario {
  titulo: string;
  esDemo: boolean;
  secciones: SeccionResumen[];
  aviso: string;
}

const SECCIONES: { tipo: TipoRegistro; titulo: string; vacio: string; limite?: number }[] = [
  { tipo: "vacuna", titulo: "Vacunas registradas", vacio: "Sin vacunas registradas.", limite: 8 },
  { tipo: "desparasitacion", titulo: "Desparasitaciones", vacio: "Sin desparasitaciones registradas.", limite: 5 },
  { tipo: "medicamento", titulo: "Medicamentos anotados", vacio: "Sin medicamentos anotados.", limite: 5 },
  { tipo: "peso", titulo: "Peso (últimos registros)", vacio: "Sin registros de peso.", limite: 6 },
  { tipo: "visita", titulo: "Visitas veterinarias", vacio: "Sin visitas registradas.", limite: 5 },
  { tipo: "observacion", titulo: "Últimas observaciones de la familia", vacio: "Sin observaciones registradas.", limite: 4 },
];

function lineaDeRegistro(r: Registro): string {
  const detalle = detalleRegistro(r);
  const principal = r.tipo === "observacion" ? "" : tituloRegistro(r);
  const partes = [formatearFecha(r.fecha), principal, detalle].filter(Boolean);
  return partes.join(" — ");
}

/** Arma el resumen estructurado. Solo reúne lo que la persona registró; no interpreta nada. */
export function construirResumen(
  mascota: Mascota,
  registros: readonly Registro[],
  hoy: FechaISO = hoyISO(),
): ResumenVeterinario {
  const propios = ordenarRecientes(registrosDe(registros, mascota.id));
  const peso = pesoActual(propios, mascota.id);
  const datos: string[] = [
    `Nombre: ${mascota.nombre}`,
    `Especie: ${ETIQUETA_ESPECIE[mascota.especie]}`,
    `Raza o tipo: ${razaOMestizo(mascota)}`,
    `Edad: ${describirEdad(mascota, hoy)}${mascota.nacimientoAproximado ? " (aproximada)" : ""}`,
    `País: ${nombreDePais(mascota.pais)}`,
    peso
      ? `Último peso: ${formatearKg(peso.kg)} (${formatearFecha(peso.fecha)})`
      : "Último peso: sin registrar",
  ];

  const secciones: SeccionResumen[] = [{ tipo: "datos", titulo: "Datos de la mascota", lineas: datos }];
  for (const s of SECCIONES) {
    const todos = propios.filter((r) => r.tipo === s.tipo);
    const delTipo = todos.slice(0, s.limite);
    const lineas = delTipo.length ? delTipo.map(lineaDeRegistro) : [s.vacio];
    const resto = todos.length - delTipo.length;
    if (resto > 0) lineas.push(`Y ${resto} más antiguo${resto === 1 ? "" : "s"} en el carnet digital.`);
    secciones.push({ tipo: s.tipo, titulo: s.titulo, lineas });
  }

  return {
    titulo: `Resumen para el veterinario — ${mascota.nombre}`,
    esDemo: mascota.origen === "demo",
    secciones,
    aviso: `Generado con ${PLANTILLA.nombreApp} el ${formatearFecha(hoy)} a partir de lo que registró el tutor. ${PLANTILLA.textos.avisoNoVeterinario}`,
  };
}

export function resumenATexto(resumen: ResumenVeterinario): string {
  const bloques = resumen.secciones.map((s) => `${s.titulo}\n${s.lineas.map((l) => `- ${l}`).join("\n")}`);
  const cabecera = resumen.esDemo ? `${resumen.titulo}\n(DATOS DE DEMOSTRACIÓN)` : resumen.titulo;
  return `${cabecera}\n\n${bloques.join("\n\n")}\n\n${resumen.aviso}`;
}
