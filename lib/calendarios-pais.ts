import type { CodigoPais } from "./paises";
import type { ReglaCuidado } from "./reglas-genericas";
import type { FechaISO } from "./fechas";

export interface FuenteVeterinaria {
  nombre: string;
  url: string;
  consultadoEn: FechaISO;
}

export interface CalendarioPais {
  /** Código de país de `paises.ts`. "EJEMPLO" solo marca la entrada de muestra. */
  pais: CodigoPais | "EJEMPLO";
  esEjemplo?: boolean;
  /** Pasa a `true` SOLO después de contrastar cada regla con fuentes veterinarias vigentes. */
  verificado: boolean;
  verificadoPor?: string;
  verificadoEn?: FechaISO;
  fuentes: FuenteVeterinaria[];
  /** Si una categoría aparece aquí, reemplaza a las reglas genéricas de esa categoría. */
  reglas: ReglaCuidado[];
}

/**
 * ═══ ARCHIVO PARA QUIEN COMPRA LA PLANTILLA ═══
 *
 * Aquí se cargan los calendarios por país. La plantilla NO trae ninguno verificado.
 *
 * Cómo agregar uno:
 *  1. Revisa con fuentes veterinarias o regulatorias vigentes de ese país (colegio de
 *     veterinarios, ministerio o autoridad sanitaria, asociaciones como WSAVA).
 *  2. Copia la entrada de ejemplo, cambia `pais` por el código de `paises.ts` y quita
 *     `esEjemplo`.
 *  3. Completa `fuentes` (con enlace y fecha de consulta), `verificadoPor` y `verificadoEn`.
 *  4. Solo entonces pon `verificado: true`.
 *
 * El motor (`calendario-vivo.ts`) ignora cualquier entrada que no esté verificada, que no
 * tenga fuentes o que sea de ejemplo, y la app nunca la presenta como calendario oficial.
 */
export const CALENDARIOS_PAIS: readonly CalendarioPais[] = [
  {
    pais: "EJEMPLO",
    esEjemplo: true,
    verificado: false,
    fuentes: [],
    reglas: [
      {
        id: "ejemplo-no-usar",
        categoria: "vacuna",
        especies: ["perro", "gato"],
        etapas: ["adulto"],
        titulo: "EJEMPLO — no usar: rellenar con datos verificados",
        detalle: "Esta regla de muestra solo enseña el formato. No refleja ningún país real.",
        intervaloDias: 365,
        primeraVezDias: 30,
      },
    ],
  },
];

/** Devuelve el calendario del país solo si cumple todas las condiciones de verificación. */
export function calendarioVerificado(
  pais: CodigoPais,
  calendarios: readonly CalendarioPais[] = CALENDARIOS_PAIS,
): CalendarioPais | undefined {
  return calendarios.find(
    (c) =>
      c.pais === pais &&
      c.verificado === true &&
      c.esEjemplo !== true &&
      c.fuentes.length > 0 &&
      c.fuentes.every((f) => f.nombre.trim() !== "" && f.url.trim() !== ""),
  );
}
