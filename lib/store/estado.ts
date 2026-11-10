import { z } from "zod";
import { cuidadoSchema } from "../cuidados";
import { fechaISOSchema, mascotaSchema } from "../mascota";
import { registroSchema } from "../registros";

export const VERSION_ESTADO = 1;

export const PLANES = ["gratis", "prueba-simulada"] as const;
export type Plan = (typeof PLANES)[number];

export const estadoSchema = z.object({
  version: z.literal(VERSION_ESTADO),
  mascotas: z.array(mascotaSchema),
  registros: z.array(registroSchema),
  cuidados: z.array(cuidadoSchema),
  mascotaActivaId: z.string().nullable(),
  /** Ya pasó por la pantalla de acceso simulada (o entró a la demostración). */
  accesoSimulado: z.boolean(),
  plan: z.enum(PLANES),
  pruebaIniciadaEn: fechaISOSchema.nullable(),
});

export type EstadoApp = z.infer<typeof estadoSchema>;

/** El usuario real siempre empieza con todo vacío. */
export function estadoVacio(): EstadoApp {
  return {
    version: VERSION_ESTADO,
    mascotas: [],
    registros: [],
    cuidados: [],
    mascotaActivaId: null,
    accesoSimulado: false,
    plan: "gratis",
    pruebaIniciadaEn: null,
  };
}
