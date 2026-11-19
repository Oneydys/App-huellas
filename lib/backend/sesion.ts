import { COOKIE_SESION } from "./acceso";
import type { ConfigSupabase } from "./config";

type ConfigAuth = Pick<ConfigSupabase, "url" | "anonKey">;

/**
 * Inicio de sesión con correo y contraseña contra Supabase Auth (solo servidor).
 * No envía enlaces ni códigos por correo. Nunca devuelve ni registra la contraseña ni las claves.
 */

const TIEMPO_MAXIMO_MS = 8000;
const CADUCIDAD_POR_DEFECTO_S = 3600;

export type ResultadoSesion =
  | { ok: true; token: string; caduca: number }
  | { ok: false; motivo: "credenciales" | "servicio" };

/** Pide a Supabase un token con correo y contraseña. Supabase responde 400 si los datos no coinciden. */
export async function iniciarSesionSupabase(
  config: ConfigAuth,
  correo: string,
  contrasena: string,
  fetchFn: typeof fetch = fetch,
): Promise<ResultadoSesion> {
  let res: Response;
  try {
    res = await fetchFn(`${config.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: config.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: correo, password: contrasena }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
  } catch {
    return { ok: false, motivo: "servicio" };
  }

  if (res.status === 400 || res.status === 401) return { ok: false, motivo: "credenciales" };
  if (!res.ok) return { ok: false, motivo: "servicio" };

  const cuerpo = (await res.json().catch(() => null)) as { access_token?: unknown; expires_in?: unknown } | null;
  if (!cuerpo || typeof cuerpo.access_token !== "string" || cuerpo.access_token === "") {
    return { ok: false, motivo: "servicio" };
  }
  const caduca = typeof cuerpo.expires_in === "number" && cuerpo.expires_in > 0 ? cuerpo.expires_in : CADUCIDAD_POR_DEFECTO_S;
  return { ok: true, token: cuerpo.access_token, caduca };
}

/** Opciones de la cookie de sesión. httpOnly: el navegador no la puede leer desde el código de la página. */
export function opcionesCookieSesion(caduca: number, produccion: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: produccion,
    path: "/",
    maxAge: caduca,
  };
}

/**
 * Pide a Supabase cerrar la sesión de este token ("local": solo este dispositivo, no todos).
 * Devuelve false si no se pudo; en ese caso la cookie se borra igual y el token caduca solo.
 */
export async function cerrarSesionSupabase(config: ConfigAuth, token: string, fetchFn: typeof fetch = fetch): Promise<boolean> {
  try {
    const res = await fetchFn(`${config.url}/auth/v1/logout?scope=local`, {
      method: "POST",
      headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export { COOKIE_SESION };
