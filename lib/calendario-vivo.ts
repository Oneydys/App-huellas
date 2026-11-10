import { calendarioVerificado, type CalendarioPais } from "./calendarios-pais";
import type { CategoriaCuidado, CuidadoProgramado } from "./cuidados";
import { diasEntre, sumarDias, type FechaISO } from "./fechas";
import { etapaDeVida, type EtapaVida, type Mascota, type Prioridad } from "./mascota";
import { REGLAS_GENERICAS, type ReglaCuidado } from "./reglas-genericas";
import { registrosDe, ultimoRegistro, type Registro } from "./registros";

/**
 * Calendario Vivo: propone los próximos cuidados a partir de la especie, la edad y lo ya
 * registrado. Las propuestas son ORIENTATIVAS: ayudan a recordar qué conversar con el
 * veterinario, no a decidir qué aplicar. Es una función pura: no guarda nada.
 *
 * Grado de certeza de cada fecha (`tipoFecha`):
 *  - indicada:   la dio el veterinario y la anotó la persona (próxima dosis, fin de tratamiento).
 *  - programada: la agendó la propia persona.
 *  - estimada:   último registro + intervalo de una regla.
 *  - sugerida:   no hay registros; se propone conversarlo pronto.
 */
export type TipoFecha = "indicada" | "programada" | "estimada" | "sugerida";
export type EstadoCuidado = "pasada" | "hoy" | "proxima" | "lejana";
export type OrigenPropuesta = "regla" | "pais" | "usuario" | "registro";

export interface PropuestaCuidado {
  id: string;
  mascotaId: string;
  categoria: CategoriaCuidado;
  titulo: string;
  detalle: string;
  fecha: FechaISO;
  diasRestantes: number;
  estado: EstadoCuidado;
  tipoFecha: TipoFecha;
  origen: OrigenPropuesta;
  cuidadoId?: string;
  /** Verdadero cuando la fecha sale de una regla: debe mostrarse como orientativa. */
  orientativo: boolean;
}

export interface EntradaCalendario {
  mascota: Mascota;
  registros: readonly Registro[];
  cuidados: readonly CuidadoProgramado[];
  hoy: FechaISO;
  /** Se puede inyectar para probar; por defecto se usa `CALENDARIOS_PAIS`. */
  calendarios?: readonly CalendarioPais[];
}

export interface ResultadoCalendario {
  propuestas: PropuestaCuidado[];
  etapa: EtapaVida;
  /** Calendario del país aplicado, solo si está verificado con fuentes. */
  calendarioPais?: CalendarioPais;
  /** Verdadero si se usan reglas genéricas porque el país no tiene calendario verificado. */
  usaReglasGenericas: boolean;
}

const CATEGORIAS_CON_REGLA = ["vacuna", "desparasitacion", "peso", "visita"] as const;
const ORDEN_CATEGORIA: Record<CategoriaCuidado, number> = {
  vacuna: 0,
  desparasitacion: 1,
  visita: 2,
  peso: 3,
  medicamento: 4,
};
const DIAS_PROXIMO = 30;

export function estadoDeFecha(diasRestantes: number): EstadoCuidado {
  if (diasRestantes < 0) return "pasada";
  if (diasRestantes === 0) return "hoy";
  if (diasRestantes <= DIAS_PROXIMO) return "proxima";
  return "lejana";
}

function aplica(regla: ReglaCuidado, mascota: Mascota, etapa: EtapaVida): boolean {
  return regla.especies.includes(mascota.especie) && regla.etapas.includes(etapa);
}

function armar(
  base: Omit<PropuestaCuidado, "diasRestantes" | "estado">,
  hoy: FechaISO,
): PropuestaCuidado {
  const diasRestantes = diasEntre(hoy, base.fecha);
  return { ...base, diasRestantes, estado: estadoDeFecha(diasRestantes) };
}

export function calcularCalendario(entrada: EntradaCalendario): ResultadoCalendario {
  const { mascota, hoy } = entrada;
  const registros = registrosDe(entrada.registros, mascota.id);
  const pendientes = entrada.cuidados.filter((c) => c.mascotaId === mascota.id && !c.completadoEn);
  const etapa = etapaDeVida(mascota, hoy);
  const calendarioPais = calendarioVerificado(mascota.pais, entrada.calendarios);
  const propuestas: PropuestaCuidado[] = [];

  // 1) Lo que la persona programó manda: no se duplica con una regla de la misma categoría.
  for (const c of pendientes) {
    propuestas.push(
      armar(
        {
          id: `${mascota.id}:cuidado:${c.id}`,
          mascotaId: mascota.id,
          categoria: c.categoria,
          titulo: c.titulo,
          detalle: c.nota ?? "",
          fecha: c.fecha,
          tipoFecha: "programada",
          origen: "usuario",
          cuidadoId: c.id,
          orientativo: false,
        },
        hoy,
      ),
    );
  }

  // 2) Reglas: las del país (si está verificado) reemplazan a las genéricas de su categoría.
  let usaReglasGenericas = false;
  for (const categoria of CATEGORIAS_CON_REGLA) {
    if (pendientes.some((c) => c.categoria === categoria)) continue;
    const delPais = calendarioPais?.reglas.find((r) => r.categoria === categoria && aplica(r, mascota, etapa));
    const generica = REGLAS_GENERICAS.find((r) => r.categoria === categoria && aplica(r, mascota, etapa));
    const regla = delPais ?? generica;
    if (!regla) continue;
    if (!delPais) usaReglasGenericas = true;

    const ultimo = ultimoRegistro(registros, mascota.id, categoria);
    let fecha: FechaISO;
    let tipoFecha: TipoFecha;
    let titulo = regla.titulo;
    let detalle = regla.detalle;
    if (ultimo?.tipo === "vacuna" && ultimo.proximaFecha) {
      fecha = ultimo.proximaFecha;
      tipoFecha = "indicada";
      titulo = `Próxima dosis: ${ultimo.nombre}`;
      detalle = "Es la fecha que anotaste de tu veterinario. Si te la cambia, registra la nueva.";
    } else if (ultimo) {
      fecha = sumarDias(ultimo.fecha, regla.intervaloDias);
      tipoFecha = "estimada";
    } else {
      fecha = sumarDias(hoy, regla.primeraVezDias);
      tipoFecha = "sugerida";
    }
    propuestas.push(
      armar(
        {
          id: `${mascota.id}:regla:${regla.id}`,
          mascotaId: mascota.id,
          categoria,
          titulo,
          detalle,
          fecha,
          tipoFecha,
          origen: delPais ? "pais" : "regla",
          orientativo: tipoFecha !== "indicada",
        },
        hoy,
      ),
    );
  }

  // 3) Fin de tratamiento: fecha que el veterinario indicó y la persona anotó.
  for (const r of registros) {
    if (r.tipo === "medicamento" && r.fin && r.fin >= hoy) {
      propuestas.push(
        armar(
          {
            id: `${mascota.id}:medicamento:${r.id}`,
            mascotaId: mascota.id,
            categoria: "medicamento",
            titulo: `Fin del tratamiento: ${r.nombre}`,
            detalle: "Es la fecha que anotaste. Antes de suspender o continuar, confirma con tu veterinario.",
            fecha: r.fin,
            tipoFecha: "indicada",
            origen: "registro",
            orientativo: false,
          },
          hoy,
        ),
      );
    }
  }

  propuestas.sort(
    (a, b) =>
      a.fecha.localeCompare(b.fecha) ||
      ORDEN_CATEGORIA[a.categoria] - ORDEN_CATEGORIA[b.categoria] ||
      a.id.localeCompare(b.id),
  );

  return { propuestas, etapa, calendarioPais, usaReglasGenericas };
}

/**
 * El cuidado que se muestra primero. Si algo ya pasó de fecha, va primero; si no, el de la
 * categoría que la persona eligió como prioritaria (si cae dentro de 45 días); si no, el más próximo.
 */
export function cuidadoDestacado(
  propuestas: readonly PropuestaCuidado[],
  prioridad?: Prioridad,
): PropuestaCuidado | undefined {
  const pasada = propuestas.find((p) => p.estado === "pasada");
  if (pasada) return pasada;
  const prioritaria = prioridad
    ? propuestas.find((p) => p.categoria === prioridad && p.diasRestantes <= 45)
    : undefined;
  return prioritaria ?? propuestas[0];
}

export type EstadoCategoria = "al-dia" | "proximo" | "pasada" | "sin-registro";

export interface ResumenCategoria {
  categoria: CategoriaCuidado;
  estado: EstadoCategoria;
  ultimo?: Registro;
  proxima?: PropuestaCuidado;
}

export const ETIQUETA_ESTADO_CATEGORIA: Record<EstadoCategoria, string> = {
  "al-dia": "Sin fechas pasadas según tus registros",
  proximo: "Próximo",
  pasada: "Pasó la fecha: consúltalo con tu veterinario",
  "sin-registro": "Sin registro",
};

/**
 * Estado de una categoría (vacunas, desparasitación…) calculado SOLO con lo que la persona
 * registró. "Al día" significa "sin fecha pasada según tus registros", nunca un aval médico.
 */
export function estadoDeCategoria(
  categoria: Exclude<CategoriaCuidado, "medicamento">,
  registros: readonly Registro[],
  propuestas: readonly PropuestaCuidado[],
  mascotaId: string,
): ResumenCategoria {
  const ultimo = ultimoRegistro(registros, mascotaId, categoria);
  const proxima = propuestas.find((p) => p.categoria === categoria && p.mascotaId === mascotaId);
  let estado: EstadoCategoria = "al-dia";
  if (!ultimo) estado = "sin-registro";
  else if (proxima?.estado === "pasada") estado = "pasada";
  else if (proxima && (proxima.estado === "hoy" || proxima.estado === "proxima")) estado = "proximo";
  return { categoria, estado, ultimo, proxima };
}

export interface EstadoDelMes {
  /** Cuidados que caen entre hoy y el fin de este mes. */
  paraEsteMes: number;
  /** Cuidados cuya fecha ya pasó. */
  pasaronFecha: number;
  /** Registros hechos durante este mes. */
  hechosEsteMes: number;
}

export function estadoDelMes(
  propuestas: readonly PropuestaCuidado[],
  registros: readonly Registro[],
  mascotaId: string,
  hoy: FechaISO,
): EstadoDelMes {
  const mes = hoy.slice(0, 7);
  return {
    paraEsteMes: propuestas.filter((p) => p.fecha.startsWith(mes) && p.fecha >= hoy).length,
    pasaronFecha: propuestas.filter((p) => p.estado === "pasada").length,
    hechosEsteMes: registros.filter((r) => r.mascotaId === mascotaId && r.fecha.startsWith(mes) && r.fecha <= hoy).length,
  };
}

/**
 * "Sin fechas pasadas" solo si ya hay registros que lo respalden; las fechas lejanas programadas se llaman "Programado".
 * No es un aval de salud: un registro antiguo puede seguir figurando así hasta que el calendario marque otra fecha.
 */
export function etiquetaEstado(p: PropuestaCuidado): string {
  if (p.estado === "lejana") return p.tipoFecha === "programada" ? "Programado" : "Sin fechas pasadas";
  return ETIQUETA_ESTADO[p.estado];
}

export const ETIQUETA_TIPO_FECHA: Record<TipoFecha, string> = {
  indicada: "Indicada por tu veterinario",
  programada: "Programada por ti",
  estimada: "Fecha estimada",
  sugerida: "Fecha sugerida",
};

export const ETIQUETA_ESTADO: Record<EstadoCuidado, string> = {
  pasada: "Pasó la fecha",
  hoy: "Hoy",
  proxima: "Próximo",
  lejana: "Más adelante",
};
