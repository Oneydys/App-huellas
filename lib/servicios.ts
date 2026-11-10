import { z } from "zod";

/**
 * ═══ PUNTOS DE CONEXIÓN ═══
 * Esta plantilla NO usa servicios reales. Cada función de este archivo tiene una
 * implementación local; quien compra la plantilla las reemplaza por su propio proveedor
 * (por ejemplo Supabase Auth, Hotmart, Resend) sin tocar las pantallas.
 */
export type ResultadoServicio = { ok: true } | { ok: false; error: string };

export const correoSchema = z
  .string()
  .trim()
  .min(1, { error: "Escribe tu correo." })
  .pipe(z.email({ error: "Revisa tu correo: debería verse como nombre@correo.com." }));

const pausa = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Acceso a la cuenta. Local: solo valida el formato del correo; no envía nada. */
export async function solicitarAcceso(correo: string): Promise<ResultadoServicio> {
  const r = correoSchema.safeParse(correo);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? "Revisa tu correo." };
  await pausa(350);
  return { ok: true };
}

export type PeriodoPlan = "mensual" | "anual";

/** Inicio de suscripción. Local: no cobra ni abre ninguna pasarela de pago. */
export async function iniciarSuscripcion(periodo: PeriodoPlan): Promise<ResultadoServicio> {
  void periodo;
  await pausa(350);
  return { ok: true };
}
