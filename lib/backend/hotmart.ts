import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Lógica del webhook de Hotmart. Funciones puras con dependencias inyectadas, para probarlas
 * sin red. Inactiva hasta que haya HOTMART_HOTTOK y Supabase configurados (responde 503).
 *
 * Códigos: 503 sin configuración, 401 token ausente o incorrecto, 400 evento mal formado,
 * 413 cuerpo demasiado grande, 200 procesado / duplicado / ignorado, 500 fallo interno
 * (para que Hotmart reintente).
 */

/** Cabecera donde Hotmart envía el token. [VERIFICAR: nombre exacto en la documentación de Hotmart] */
export const CABECERA_TOKEN_HOTMART = "x-hotmart-hottok";

/** Un evento de Hotmart es pequeño; por encima de este tamaño se rechaza sin procesar. */
const TAMANO_MAXIMO_CUERPO = 64 * 1024;

const LONGITUD_MAXIMA_TRANSACCION = 100;

export type EstadoCompra = "activa" | "reembolsada" | "cancelada";

/**
 * Eventos que cambian el acceso. Cualquier otro evento responde 200 y no hace nada.
 * [VERIFICAR] Todos los nombres de evento deben confirmarse en la documentación de Hotmart.
 */
const MAPA_EVENTOS = new Map<string, EstadoCompra>([
  ["PURCHASE_APPROVED", "activa"], // [VERIFICAR] compra aprobada
  ["PURCHASE_REACTIVATED", "activa"], // [VERIFICAR] contracancelación: nombre no confirmado
  ["PURCHASE_REFUNDED", "reembolsada"], // [VERIFICAR] reembolso
  ["PURCHASE_CANCELED", "cancelada"], // [VERIFICAR] cancelación de compra
  ["SUBSCRIPTION_CANCELLATION", "cancelada"], // [VERIFICAR] cancelación de suscripción
]);

/** Estado de la compra para un evento de Hotmart, o null si el evento no afecta al acceso. */
export function mapearEvento(evento: string): EstadoCompra | null {
  return MAPA_EVENTOS.get(evento) ?? null;
}

/** Solo una compra activa da acceso a /app. */
export function daAcceso(estado: EstadoCompra): boolean {
  return estado === "activa";
}

/**
 * Compara el token recibido con el esperado en tiempo constante.
 * Se comparan los hashes SHA-256 de ambos: siempre miden 32 bytes, así timingSafeEqual
 * nunca recibe longitudes distintas y no lanza.
 */
export function tokenValido(recibido: string | null | undefined, esperado: string): boolean {
  if (!recibido || !esperado) return false;
  const a = createHash("sha256").update(recibido, "utf8").digest();
  const b = createHash("sha256").update(esperado, "utf8").digest();
  return timingSafeEqual(a, b);
}

/** SHA-256 en hexadecimal del correo en minúsculas y sin espacios. Así no se guarda el correo en claro. */
export function hashCorreo(correo: string): string {
  return createHash("sha256").update(correo.trim().toLowerCase(), "utf8").digest("hex");
}

/** Fila que se guarda en `compras`. No incluye el correo ni ningún otro dato del comprador. */
export interface CompraNueva {
  transaccion: string;
  correo_hash: string;
  evento: string;
  estado: EstadoCompra;
  recibido_en: string;
}

export interface CompraGuardada {
  transaccion: string;
  estado: EstadoCompra;
}

export interface RepositorioCompras {
  /** Inserta la compra si es nueva. Devuelve null si la insertó, o la compra ya guardada. */
  insertarSiNueva(compra: CompraNueva): Promise<CompraGuardada | null>;
  /** Cambia el estado de una compra ya guardada. */
  cambiarEstado(
    transaccion: string,
    cambio: { estado: EstadoCompra; evento: string; recibido_en: string },
  ): Promise<void>;
}

export interface DepsWebhook {
  /** Valor de HOTMART_HOTTOK. Sin valor = sin configuración (503). */
  tokenEsperado: string | undefined;
  /** Repositorio de compras. Sin repositorio = sin configuración (503). */
  repositorio: RepositorioCompras | undefined;
  /** Reloj inyectable para las pruebas. */
  ahora?: () => Date;
  /** Registro de errores. Solo recibe un mensaje fijo, nunca datos de la petición. */
  registrarError?: (mensaje: string) => void;
}

/** Lo mínimo que se necesita de las cabeceras. `Headers` cumple esta forma. */
export interface CabecerasLeibles {
  get(nombre: string): string | null;
}

export interface RespuestaWebhook {
  status: number;
  cuerpo: { ok: boolean; resultado?: string; error?: string };
}

function respuesta(status: number, cuerpo: RespuestaWebhook["cuerpo"]): RespuestaWebhook {
  return { status, cuerpo };
}

function leerObjeto(valor: unknown): Record<string, unknown> | null {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : null;
}

function leerTexto(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio === "" ? null : limpio;
}

/**
 * Procesa un evento entrante de Hotmart. El orden importa: configuración, token,
 * tamaño, formato y solo después la escritura. Nada se procesa sin token válido.
 */
export async function manejarEvento(
  cuerpo: string,
  cabeceras: CabecerasLeibles,
  deps: DepsWebhook,
): Promise<RespuestaWebhook> {
  if (!deps.tokenEsperado || !deps.repositorio) {
    return respuesta(503, { ok: false, error: "sin_configuracion" });
  }

  if (!tokenValido(cabeceras.get(CABECERA_TOKEN_HOTMART), deps.tokenEsperado)) {
    return respuesta(401, { ok: false, error: "token_no_valido" });
  }

  if (Buffer.byteLength(cuerpo, "utf8") > TAMANO_MAXIMO_CUERPO) {
    return respuesta(413, { ok: false, error: "cuerpo_demasiado_grande" });
  }

  let datos: unknown;
  try {
    datos = JSON.parse(cuerpo);
  } catch {
    return respuesta(400, { ok: false, error: "cuerpo_no_valido" });
  }

  const evento = leerObjeto(datos);
  if (!evento) return respuesta(400, { ok: false, error: "cuerpo_no_valido" });

  // [VERIFICAR] Campo del nombre del evento en el cuerpo de Hotmart.
  const nombreEvento = leerTexto(evento.event);
  if (!nombreEvento) return respuesta(400, { ok: false, error: "evento_incompleto" });

  const estado = mapearEvento(nombreEvento);
  if (!estado) return respuesta(200, { ok: true, resultado: "ignorado" });

  // [VERIFICAR] Rutas de la transacción y del correo del comprador en el cuerpo de Hotmart.
  const data = leerObjeto(evento.data);
  const compra = leerObjeto(data?.purchase);
  const comprador = leerObjeto(data?.buyer);
  const transaccion = leerTexto(compra?.transaction);
  const correo = leerTexto(comprador?.email);
  if (!transaccion || transaccion.length > LONGITUD_MAXIMA_TRANSACCION || !correo || !correo.includes("@")) {
    return respuesta(400, { ok: false, error: "evento_incompleto" });
  }

  try {
    const ahora = (deps.ahora ?? (() => new Date()))().toISOString();
    const guardada = await deps.repositorio.insertarSiNueva({
      transaccion,
      correo_hash: hashCorreo(correo),
      evento: nombreEvento,
      estado,
      recibido_en: ahora,
    });

    // Primera vez: ya quedó guardada.
    if (guardada === null) return respuesta(200, { ok: true, resultado: "registrada" });

    // Mismo evento que ya se procesó: no se repite ningún efecto.
    if (guardada.estado === estado) return respuesta(200, { ok: true, resultado: "duplicada" });

    // Mismo pedido, otro estado (por ejemplo, un reembolso): se aplica el cambio.
    await deps.repositorio.cambiarEstado(transaccion, { estado, evento: nombreEvento, recibido_en: ahora });
    return respuesta(200, { ok: true, resultado: "actualizada" });
  } catch {
    // Fallo de escritura: 500 para que Hotmart reintente. Nunca 200 ante un fallo.
    deps.registrarError?.("Webhook de Hotmart: no se pudo guardar el evento.");
    return respuesta(500, { ok: false, error: "error_interno" });
  }
}
