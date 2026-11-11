import { z } from "zod";
import { formatearFecha, type FechaISO } from "./fechas";
import { fechaISOSchema, ORIGENES } from "./mascota";

export const TIPOS_REGISTRO = [
  "vacuna",
  "desparasitacion",
  "peso",
  "visita",
  "observacion",
  "medicamento",
] as const;
export type TipoRegistro = (typeof TIPOS_REGISTRO)[number];

export const ETIQUETA_TIPO: Record<TipoRegistro, string> = {
  vacuna: "Vacuna",
  desparasitacion: "Desparasitación",
  peso: "Peso",
  visita: "Visita veterinaria",
  observacion: "Observación",
  medicamento: "Medicamento",
};

const texto = (max: number, vacio: string) =>
  z
    .string({ error: vacio })
    .trim()
    .min(1, { error: vacio })
    .max(max, { error: `Admite hasta ${max} caracteres.` });

const opcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Admite hasta ${max} caracteres.` })
    .optional()
    .transform((v) => (v ? v : undefined));

const base = {
  id: z.string().min(1),
  mascotaId: z.string().min(1),
  fecha: fechaISOSchema,
  origen: z.enum(ORIGENES),
  nota: opcional(280),
};

const fechaOpcional = fechaISOSchema.optional();

export const registroSchema = z.discriminatedUnion("tipo", [
  z.object({
    ...base,
    tipo: z.literal("vacuna"),
    nombre: texto(60, "Indica qué vacuna fue."),
    // Fecha de la próxima dosis tal como la indicó el veterinario (dato de la persona).
    proximaFecha: fechaOpcional,
  }),
  z.object({
    ...base,
    tipo: z.literal("desparasitacion"),
    via: z.enum(["interna", "externa", "ambas", "sin-especificar"], { error: "Elige el tipo de desparasitación." }),
    producto: opcional(60),
  }),
  z.object({
    ...base,
    tipo: z.literal("peso"),
    kg: z
      .number({ error: "Escribe el peso en kilogramos." })
      .positive({ error: "El peso debe ser mayor que cero." })
      .max(120, { error: "Revisa el peso: parece demasiado alto." }),
  }),
  z.object({
    ...base,
    tipo: z.literal("visita"),
    motivo: texto(80, "Escribe el motivo de la visita."),
    lugar: opcional(60),
  }),
  z.object({
    ...base,
    tipo: z.literal("observacion"),
    texto: texto(280, "Escribe lo que observaste."),
  }),
  z.object({
    ...base,
    tipo: z.literal("medicamento"),
    nombre: texto(60, "Indica el nombre del medicamento."),
    // Se copia lo que indicó el veterinario; Peluvet nunca sugiere dosis.
    dosis: opcional(80),
    fin: fechaOpcional,
  }),
]);

export type Registro = z.infer<typeof registroSchema>;
export type RegistroDe<T extends TipoRegistro> = Extract<Registro, { tipo: T }>;

/** Datos que llegan de un formulario: sin id ni origen. */
export type DatosRegistro = { [T in Registro as T["tipo"]]: Omit<T, "id" | "origen"> }[TipoRegistro] & {
  origen?: Registro["origen"];
};

export type ResultadoRegistro =
  | { ok: true; registro: Registro }
  | { ok: false; errores: Record<string, string> };

export function crearRegistro(
  datos: unknown,
  contexto: { id: string; hoy: FechaISO },
): ResultadoRegistro {
  const crudo = (typeof datos === "object" && datos !== null ? datos : {}) as Record<string, unknown>;
  const r = registroSchema.safeParse({ origen: "usuario", ...crudo, id: contexto.id });
  if (!r.success) {
    const errores: Record<string, string> = {};
    for (const issue of r.error.issues) {
      const campo = String(issue.path[0] ?? "general");
      errores[campo] ??= issue.message;
    }
    return { ok: false, errores };
  }
  const reg = r.data;
  if (reg.fecha > contexto.hoy) {
    return { ok: false, errores: { fecha: "Registra cuidados ya realizados: la fecha no puede ser futura." } };
  }
  if (reg.tipo === "vacuna" && reg.proximaFecha && reg.proximaFecha <= reg.fecha) {
    return { ok: false, errores: { proximaFecha: "La próxima dosis debe ser posterior a esta fecha." } };
  }
  if (reg.tipo === "medicamento" && reg.fin && reg.fin < reg.fecha) {
    return { ok: false, errores: { fin: "La fecha de fin no puede ser anterior al inicio." } };
  }
  return { ok: true, registro: reg };
}

export function registrosDe(registros: readonly Registro[], mascotaId: string): Registro[] {
  return registros.filter((r) => r.mascotaId === mascotaId);
}

/** Más reciente primero; a igual fecha, el último agregado primero. */
export function ordenarRecientes(registros: readonly Registro[]): Registro[] {
  return registros
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (a.r.fecha === b.r.fecha ? b.i - a.i : a.r.fecha < b.r.fecha ? 1 : -1))
    .map(({ r }) => r);
}

export function ultimoRegistro<T extends TipoRegistro>(
  registros: readonly Registro[],
  mascotaId: string,
  tipo: T,
): RegistroDe<T> | undefined {
  return ordenarRecientes(registrosDe(registros, mascotaId)).find(
    (r): r is RegistroDe<T> => r.tipo === tipo,
  );
}

export function pesoActual(registros: readonly Registro[], mascotaId: string): RegistroDe<"peso"> | undefined {
  return ultimoRegistro(registros, mascotaId, "peso");
}

/** Pesos de más antiguo a más reciente, útil para tendencias. */
export function historialDePeso(registros: readonly Registro[], mascotaId: string): RegistroDe<"peso">[] {
  return ordenarRecientes(registrosDe(registros, mascotaId))
    .filter((r): r is RegistroDe<"peso"> => r.tipo === "peso")
    .reverse();
}

export function formatearKg(kg: number): string {
  // Coma decimal (formato en español); la entrada acepta coma o punto.
  return `${String(Math.round(kg * 100) / 100).replace(".", ",")} kg`;
}

/**
 * Lee un peso escrito por una persona ("4,5", "4.5 kg"). Devuelve `undefined` si está vacío
 * y `NaN` si no se entiende, para que el formulario pueda mostrar un error claro.
 */
export function parsearKg(texto: string): number | undefined {
  const limpio = texto.trim().toLowerCase().replace(/\s*kg$/, "").replace(",", ".");
  if (limpio === "") return undefined;
  return /^\d+(\.\d{1,2})?$/.test(limpio) ? Number(limpio) : Number.NaN;
}

export function tituloRegistro(r: Registro): string {
  switch (r.tipo) {
    case "vacuna":
      return r.nombre;
    case "desparasitacion":
      return r.via === "sin-especificar" ? "Desparasitación" : `Desparasitación ${r.via}`;
    case "peso":
      return formatearKg(r.kg);
    case "visita":
      return r.motivo;
    case "observacion":
      return "Observación";
    case "medicamento":
      return r.nombre;
  }
}

export function detalleRegistro(r: Registro): string {
  const partes: string[] = [];
  switch (r.tipo) {
    case "vacuna":
      if (r.proximaFecha) partes.push(`Próxima dosis indicada: ${formatearFecha(r.proximaFecha)}`);
      break;
    case "desparasitacion":
      if (r.producto) partes.push(r.producto);
      break;
    case "visita":
      if (r.lugar) partes.push(r.lugar);
      break;
    case "observacion":
      partes.push(r.texto);
      break;
    case "medicamento":
      if (r.dosis) partes.push(`Indicación: ${r.dosis}`);
      if (r.fin) partes.push(`Hasta ${formatearFecha(r.fin)}`);
      break;
    case "peso":
      break;
  }
  if (r.nota && r.tipo !== "observacion") partes.push(r.nota);
  return partes.join(" · ");
}
