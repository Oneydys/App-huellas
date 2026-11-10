import { z } from "zod";
import type { FechaISO } from "./fechas";
import { fechaISOSchema, ORIGENES } from "./mascota";

export const CATEGORIAS_CUIDADO = ["vacuna", "desparasitacion", "peso", "visita", "medicamento"] as const;
export type CategoriaCuidado = (typeof CATEGORIAS_CUIDADO)[number];

export const ETIQUETA_CATEGORIA: Record<CategoriaCuidado, string> = {
  vacuna: "Vacuna",
  desparasitacion: "Desparasitación",
  peso: "Control de peso",
  visita: "Visita veterinaria",
  medicamento: "Medicamento",
};

/** Cuidado que la propia persona programa; Huellas no envía avisos por sí sola. */
export const cuidadoSchema = z.object({
  id: z.string().min(1),
  mascotaId: z.string().min(1),
  categoria: z.enum(CATEGORIAS_CUIDADO),
  titulo: z
    .string({ error: "Escribe un título." })
    .trim()
    .min(1, { error: "Escribe un título." })
    .max(60, { error: "El título admite hasta 60 caracteres." }),
  fecha: fechaISOSchema,
  nota: z
    .string()
    .trim()
    .max(280)
    .optional()
    .transform((v) => (v ? v : undefined)),
  completadoEn: fechaISOSchema.optional(),
  origen: z.enum(ORIGENES),
});

export type CuidadoProgramado = z.infer<typeof cuidadoSchema>;

export type ResultadoCuidado =
  | { ok: true; cuidado: CuidadoProgramado }
  | { ok: false; errores: Record<string, string> };

export function crearCuidado(datos: unknown, contexto: { id: string; hoy: FechaISO }): ResultadoCuidado {
  const crudo = (typeof datos === "object" && datos !== null ? datos : {}) as Record<string, unknown>;
  const r = cuidadoSchema.safeParse({ origen: "usuario", ...crudo, id: contexto.id });
  if (!r.success) {
    const errores: Record<string, string> = {};
    for (const issue of r.error.issues) {
      errores[String(issue.path[0] ?? "general")] ??= issue.message;
    }
    return { ok: false, errores };
  }
  if (r.data.fecha < contexto.hoy) {
    return { ok: false, errores: { fecha: "Elige una fecha de hoy en adelante." } };
  }
  return { ok: true, cuidado: r.data };
}
