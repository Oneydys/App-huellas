/**
 * Decisión de acceso a /app. La usa proxy.ts. Lógica pura con dependencias inyectadas.
 *
 * Sin configuración, todo pasa (la demo sigue igual). Con configuración, hace falta una sesión
 * válida y un acceso activo. Ante cualquier error se niega el acceso (falla cerrado).
 */

/** Nombre de la cookie que guarda el token de sesión. El inicio de sesión aún no la escribe. */
export const COOKIE_SESION = "huellas-sesion";

export const RUTA_ACCESO = "/acceso";

/** Formato plausible de un JWT. Evita pasar valores raros a las cabeceras. */
const FORMATO_TOKEN = /^[A-Za-z0-9._-]{20,4096}$/;

export type DecisionAcceso = "pasa" | "redirige";

export interface DepsAcceso {
  /** false = sin configuración: la decisión es siempre "pasa". */
  configurado: boolean;
  /** Devuelve el usuario de la sesión, o null si el token no es válido. */
  verificarSesion(token: string): Promise<{ userId: string } | null>;
  /** true si el usuario tiene un acceso activo. */
  tieneAccesoActivo(userId: string, token: string): Promise<boolean>;
}

export async function decidirAcceso(token: string | undefined, deps: DepsAcceso): Promise<DecisionAcceso> {
  if (!deps.configurado) return "pasa";
  if (!token || !FORMATO_TOKEN.test(token)) return "redirige";

  try {
    const sesion = await deps.verificarSesion(token);
    if (!sesion) return "redirige";
    return (await deps.tieneAccesoActivo(sesion.userId, token)) ? "pasa" : "redirige";
  } catch {
    // Si Supabase no responde o la respuesta es inesperada, no se da acceso.
    return "redirige";
  }
}
