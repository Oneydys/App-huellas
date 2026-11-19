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

/**
 * Inicio de sesión con correo y contraseña (Supabase Auth, a través de /api/acceso).
 * Si las variables de Supabase no están definidas, responde que no está activo: la demo sigue igual.
 */
export async function iniciarSesionConContrasena(correo: string, contrasena: string): Promise<ResultadoServicio> {
  const r = correoSchema.safeParse(correo);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? "Revisa tu correo." };
  if (contrasena === "") return { ok: false, error: "Escribe tu contraseña." };
  try {
    const res = await fetch("/api/acceso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: r.data, contrasena }),
      cache: "no-store",
    });
    if (res.ok) return { ok: true };
    if (res.status === 401) return { ok: false, error: "Correo o contraseña incorrectos." };
    if (res.status === 503) return { ok: false, error: "El inicio de sesión con contraseña no está activo en este dispositivo." };
    return { ok: false, error: "No pudimos conectar. Inténtalo otra vez." };
  } catch {
    return { ok: false, error: "Sin conexión. Revisa tu internet y vuelve a intentarlo." };
  }
}

/** Cierra la sesión del servidor. Nunca falla de forma visible: la pantalla sigue funcionando. */
export async function cerrarSesion(): Promise<void> {
  try {
    await fetch("/api/acceso", { method: "DELETE", cache: "no-store" });
  } catch {
    // Sin red no hay cookie que borrar desde aquí; se ignora.
  }
}

/** true si el acceso real con Supabase está activo. Si no se puede saber, se asume que sí (la demo se oculta). */
export async function accesoRealConfigurado(): Promise<boolean> {
  try {
    const res = await fetch("/api/acceso", { cache: "no-store" });
    if (!res.ok) return true;
    const datos = (await res.json().catch(() => null)) as { configurado?: unknown } | null;
    return typeof datos?.configurado === "boolean" ? datos.configurado : true;
  } catch {
    return true;
  }
}
