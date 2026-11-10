/**
 * Configuración del kit de backend. Todo se activa con variables de entorno.
 * Sin ellas, cada conexión está inactiva y la app sigue en modo demo.
 *
 * Nunca devuelve ni registra valores de claves: solo nombres de variables.
 * Este archivo es solo del servidor. No lo importes desde componentes de cliente.
 */

export type ConexionBackend = "supabase" | "hotmart";

export type Entorno = Readonly<Record<string, string | undefined>>;

export interface ConfigSupabase {
  url: string;
  anonKey: string;
  serviceKey: string;
}

interface Requisito {
  nombre: string;
  valido?: (valor: string) => boolean;
}

/** Acepta https, o http solo para una instancia local de Supabase (localhost o 127.0.0.1). */
function esUrlAceptable(valor: string): boolean {
  try {
    const url = new URL(valor);
    if (url.protocol === "https:") return true;
    return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

const REQUISITOS: Readonly<Record<ConexionBackend, readonly Requisito[]>> = {
  supabase: [{ nombre: "SUPABASE_URL", valido: esUrlAceptable }, { nombre: "SUPABASE_ANON_KEY" }, { nombre: "SUPABASE_SERVICE_ROLE_KEY" }],
  // [VERIFICAR] Hotmart: el token del webhook se define en el panel de Hotmart y se copia aquí.
  hotmart: [{ nombre: "HOTMART_HOTTOK" }],
};

function leerValor(entorno: Entorno, nombre: string): string {
  return (entorno[nombre] ?? "").trim();
}

/** Nombres de las variables que faltan o no son válidas para esa conexión. Vacío = conexión activa. */
export function configuracionFaltante(conexion: ConexionBackend, entorno: Entorno = process.env): string[] {
  return REQUISITOS[conexion]
    .filter((requisito) => {
      const valor = leerValor(entorno, requisito.nombre);
      if (valor === "") return true;
      return requisito.valido ? !requisito.valido(valor) : false;
    })
    .map((requisito) => requisito.nombre);
}

export function conexionActiva(conexion: ConexionBackend, entorno: Entorno = process.env): boolean {
  return configuracionFaltante(conexion, entorno).length === 0;
}

/** Configuración de Supabase para el servidor, o null si la conexión está inactiva. */
export function leerSupabase(entorno: Entorno = process.env): ConfigSupabase | null {
  if (!conexionActiva("supabase", entorno)) return null;
  return {
    url: leerValor(entorno, "SUPABASE_URL").replace(/\/+$/, ""),
    anonKey: leerValor(entorno, "SUPABASE_ANON_KEY"),
    serviceKey: leerValor(entorno, "SUPABASE_SERVICE_ROLE_KEY"),
  };
}

/** Token del webhook de Hotmart, o null si la conexión está inactiva. */
export function leerHottok(entorno: Entorno = process.env): string | null {
  if (!conexionActiva("hotmart", entorno)) return null;
  return leerValor(entorno, "HOTMART_HOTTOK");
}
