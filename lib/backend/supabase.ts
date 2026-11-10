import type { ConfigSupabase } from "./config";
import type { CompraGuardada, CompraNueva, EstadoCompra, RepositorioCompras } from "./hotmart";
import type { DepsAcceso } from "./acceso";

/**
 * Adaptador mínimo de Supabase con fetch (API REST de PostgREST y de Auth).
 * No añade dependencias. Solo se usa cuando hay configuración; sin ella no se llama a nada.
 * Nunca incluye claves ni cuerpos de respuesta en los errores.
 */

const TIEMPO_MAXIMO_MS = 8000;

const ESTADOS: readonly EstadoCompra[] = ["activa", "reembolsada", "cancelada"];

const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Error con solo el código HTTP y la operación. No guarda la respuesta ni las claves. */
export class ErrorSupabase extends Error {
  readonly estado: number;

  constructor(estado: number, operacion: string) {
    super(`Supabase respondió ${estado} al ${operacion}.`);
    this.name = "ErrorSupabase";
    this.estado = estado;
  }
}

function esEstado(valor: unknown): valor is EstadoCompra {
  return typeof valor === "string" && (ESTADOS as readonly string[]).includes(valor);
}

/**
 * Repositorio de `compras` con la clave de servicio (solo servidor). Usa RLS-bypass
 * porque el webhook no tiene sesión de usuario.
 */
export function crearRepositorioCompras(config: ConfigSupabase, fetchFn: typeof fetch = fetch): RepositorioCompras {
  const base = `${config.url}/rest/v1/compras`;

  const cabeceras = (extra: Record<string, string> = {}): Record<string, string> => ({
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
    "Content-Type": "application/json",
    ...extra,
  });

  async function leerCompra(transaccion: string): Promise<CompraGuardada | null> {
    const url = `${base}?select=transaccion,estado&transaccion=eq.${encodeURIComponent(transaccion)}&limit=1`;
    const res = await fetchFn(url, {
      headers: cabeceras({ Accept: "application/json" }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
    if (!res.ok) throw new ErrorSupabase(res.status, "leer la compra");
    const filas = (await res.json()) as unknown;
    if (!Array.isArray(filas) || filas.length === 0) return null;
    const fila = filas[0] as { transaccion?: unknown; estado?: unknown };
    if (typeof fila.transaccion !== "string" || !esEstado(fila.estado)) {
      throw new ErrorSupabase(500, "leer la compra");
    }
    return { transaccion: fila.transaccion, estado: fila.estado };
  }

  return {
    async insertarSiNueva(compra: CompraNueva): Promise<CompraGuardada | null> {
      // Upsert que ignora duplicados: si la clave ya existe, PostgREST no inserta y devuelve []. [VERIFICAR al conectar]
      const res = await fetchFn(`${base}?on_conflict=transaccion`, {
        method: "POST",
        headers: cabeceras({ Prefer: "resolution=ignore-duplicates,return=representation" }),
        body: JSON.stringify([compra]),
        cache: "no-store",
        signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
      });
      if (!res.ok) throw new ErrorSupabase(res.status, "insertar la compra");
      const filas = (await res.json()) as unknown;
      if (Array.isArray(filas) && filas.length > 0) return null;

      const existente = await leerCompra(compra.transaccion);
      if (existente === null) throw new ErrorSupabase(404, "leer la compra duplicada");
      return existente;
    },

    async cambiarEstado(transaccion, cambio): Promise<void> {
      const res = await fetchFn(`${base}?transaccion=eq.${encodeURIComponent(transaccion)}`, {
        method: "PATCH",
        headers: cabeceras({ Prefer: "return=minimal" }),
        body: JSON.stringify({ estado: cambio.estado, evento: cambio.evento, recibido_en: cambio.recibido_en }),
        cache: "no-store",
        signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
      });
      if (!res.ok) throw new ErrorSupabase(res.status, "actualizar la compra");
    },
  };
}

/**
 * Comprobaciones de acceso para el proxy. Usa el token del propio usuario, así RLS limita
 * lo que puede leer, y no hace falta la clave de servicio en el proxy.
 */
export function crearDepsAccesoSupabase(
  config: ConfigSupabase,
  fetchFn: typeof fetch = fetch,
): Omit<DepsAcceso, "configurado"> {
  return {
    async verificarSesion(token: string) {
      const res = await fetchFn(`${config.url}/auth/v1/user`, {
        headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
      });
      if (res.status === 401 || res.status === 403) return null;
      if (!res.ok) throw new ErrorSupabase(res.status, "verificar la sesión");
      const usuario = (await res.json()) as { id?: unknown };
      return typeof usuario.id === "string" && FORMATO_UUID.test(usuario.id) ? { userId: usuario.id } : null;
    },

    async tieneAccesoActivo(userId: string, token: string) {
      if (!FORMATO_UUID.test(userId)) return false;
      const url = `${config.url}/rest/v1/accesos?select=user_id&user_id=eq.${userId}&activo=eq.true&limit=1`;
      const res = await fetchFn(url, {
        headers: { apikey: config.anonKey, Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
      });
      if (!res.ok) throw new ErrorSupabase(res.status, "leer el acceso");
      const filas = (await res.json()) as unknown;
      return Array.isArray(filas) && filas.length > 0;
    },
  };
}
