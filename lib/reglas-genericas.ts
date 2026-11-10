import type { CategoriaCuidado } from "./cuidados";
import type { EtapaVida } from "./mascota";
import type { Especie } from "./personajes";

/**
 * Regla del Calendario Vivo. Describe CUÁNDO conviene volver a conversar un cuidado con el
 * veterinario, no QUÉ aplicar: nunca incluye productos, dosis ni diagnósticos.
 */
export interface ReglaCuidado {
  id: string;
  categoria: Exclude<CategoriaCuidado, "medicamento">;
  especies: readonly Especie[];
  etapas: readonly EtapaVida[];
  titulo: string;
  detalle: string;
  /** Días desde el último registro de esa categoría hasta el siguiente cuidado estimado. */
  intervaloDias: number;
  /** Si no hay ningún registro: días desde hoy para conversarlo con el veterinario. */
  primeraVezDias: number;
}

const AMBAS: readonly Especie[] = ["perro", "gato"];

/**
 * REGLAS GENÉRICAS Y CONSERVADORAS (orientativas). Son intervalos amplios de revisión,
 * iguales para perros y gatos, que no sustituyen el esquema que defina un veterinario ni
 * la normativa de cada país. Quien adapte la plantilla puede ajustarlas tras revisarlas
 * con fuentes veterinarias; los calendarios por país viven en `calendarios-pais.ts`.
 *
 * [VERIFICAR: fuente] Cada `intervaloDias` y `primeraVezDias` (días) de esta lista no tiene
 * una fuente veterinaria citada. Confírmalos con un profesional de salud animal antes de publicar.
 */
export const REGLAS_GENERICAS: readonly ReglaCuidado[] = [
  // Vacunas
  {
    id: "vacuna-cria",
    categoria: "vacuna",
    especies: AMBAS,
    etapas: ["cria"],
    titulo: "Siguiente dosis del esquema de vacunas",
    detalle: "En las crías, las vacunas suelen darse en varias dosis separadas por semanas. Tu veterinario define cuáles y cuándo.",
    intervaloDias: 28,
    primeraVezDias: 7,
  },
  {
    id: "vacuna-juvenil",
    categoria: "vacuna",
    especies: AMBAS,
    etapas: ["juvenil"],
    titulo: "Revisar si el esquema de vacunas está completo",
    detalle: "Pregunta a tu veterinario si falta alguna dosis y cuándo toca el refuerzo del primer año.",
    intervaloDias: 90,
    primeraVezDias: 14,
  },
  {
    id: "vacuna-adulto",
    categoria: "vacuna",
    especies: AMBAS,
    etapas: ["adulto", "mayor"],
    titulo: "Revisar refuerzos de vacunas",
    detalle: "Una vez al año conviene confirmar con tu veterinario qué refuerzos corresponden.",
    intervaloDias: 365,
    primeraVezDias: 14,
  },
  // Desparasitación
  {
    id: "despar-cria",
    categoria: "desparasitacion",
    especies: AMBAS,
    etapas: ["cria"],
    titulo: "Revisar la desparasitación",
    detalle: "Las crías suelen necesitarla con más frecuencia. Tu veterinario te dice qué usar y con qué frecuencia, según su peso.",
    intervaloDias: 14,
    primeraVezDias: 7,
  },
  {
    id: "despar-juvenil",
    categoria: "desparasitacion",
    especies: AMBAS,
    etapas: ["juvenil"],
    titulo: "Revisar la desparasitación",
    detalle: "Durante el primer año suele repetirse cada pocas semanas. Confirma la frecuencia con tu veterinario.",
    intervaloDias: 30,
    primeraVezDias: 14,
  },
  {
    id: "despar-adulto",
    categoria: "desparasitacion",
    especies: AMBAS,
    etapas: ["adulto", "mayor"],
    titulo: "Revisar la desparasitación",
    detalle: "En adultos suele revisarse cada pocos meses, según su estilo de vida. Tu veterinario te dice cuál es el indicado.",
    intervaloDias: 90,
    primeraVezDias: 14,
  },
  // Peso (solo registrarlo: no interpreta resultados)
  {
    id: "peso-cria",
    categoria: "peso",
    especies: AMBAS,
    etapas: ["cria"],
    titulo: "Registrar su peso",
    detalle: "Las crías cambian rápido. Anotar su peso cada pocas semanas deja un historial útil para el veterinario.",
    intervaloDias: 14,
    primeraVezDias: 0,
  },
  {
    id: "peso-juvenil",
    categoria: "peso",
    especies: AMBAS,
    etapas: ["juvenil"],
    titulo: "Registrar su peso",
    detalle: "Un registro mensual ayuda a ver cómo crece.",
    intervaloDias: 30,
    primeraVezDias: 0,
  },
  {
    id: "peso-adulto",
    categoria: "peso",
    especies: AMBAS,
    etapas: ["adulto"],
    titulo: "Registrar su peso",
    detalle: "Pesarlo cada pocos meses deja ver cambios sostenidos. Si notas uno brusco, consulta a tu veterinario.",
    intervaloDias: 90,
    primeraVezDias: 0,
  },
  {
    id: "peso-mayor",
    categoria: "peso",
    especies: AMBAS,
    etapas: ["mayor"],
    titulo: "Registrar su peso",
    detalle: "En mascotas mayores conviene anotarlo con más frecuencia. Los cambios sostenidos se comentan con el veterinario.",
    intervaloDias: 60,
    primeraVezDias: 0,
  },
  // Visita veterinaria
  {
    id: "visita-joven",
    categoria: "visita",
    especies: AMBAS,
    etapas: ["cria", "juvenil"],
    titulo: "Revisión con tu veterinario",
    detalle: "Durante el primer año las visitas de control son frecuentes. Pregunta cuándo volver.",
    intervaloDias: 60,
    primeraVezDias: 14,
  },
  {
    id: "visita-adulto",
    categoria: "visita",
    especies: AMBAS,
    etapas: ["adulto"],
    titulo: "Revisión anual con tu veterinario",
    detalle: "Una revisión al año sirve para conversar con tu veterinario sobre su estado. Lleva el resumen de Huellas si quieres.",
    intervaloDias: 365,
    primeraVezDias: 30,
  },
  {
    id: "visita-mayor",
    categoria: "visita",
    especies: AMBAS,
    etapas: ["mayor"],
    titulo: "Revisión con tu veterinario",
    detalle: "En mascotas mayores suelen recomendarse revisiones más seguidas. Tu veterinario define cada cuánto.",
    intervaloDias: 180,
    primeraVezDias: 30,
  },
];
