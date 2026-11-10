import { describe, expect, it } from "vitest";
import {
  CABECERA_TOKEN_HOTMART,
  daAcceso,
  hashCorreo,
  manejarEvento,
  mapearEvento,
  tokenValido,
  type CompraGuardada,
  type CompraNueva,
  type DepsWebhook,
  type EstadoCompra,
  type RepositorioCompras,
} from "./hotmart";

// Valores ficticios marcados como prueba. No son claves reales.
const TOKEN = "prueba-token-no-real";
const CORREO = "Ana@Ejemplo.com";
const HASH_ANA = "52f5655387a4bdcb850a93ce7223979b4a360fa146c89c47d5d897d10a13f76e"; // sha256("ana@ejemplo.com")

function cabeceras(token?: string): Headers {
  const h = new Headers();
  if (token !== undefined) h.set(CABECERA_TOKEN_HOTMART, token);
  return h;
}

function evento(event = "PURCHASE_APPROVED", transaccion = "HP-PRUEBA-001"): string {
  return JSON.stringify({
    event,
    data: { purchase: { transaction: transaccion }, buyer: { email: CORREO } },
  });
}

/** Repositorio en memoria que cuenta las escrituras. `fallo` hace que una operación lance. */
function repositorioFalso(opciones: { inicial?: Record<string, EstadoCompra>; fallo?: "insertar" | "cambiar" } = {}) {
  const guardadas = new Map<string, EstadoCompra>(Object.entries(opciones.inicial ?? {}));
  const insertadas: CompraNueva[] = [];
  const cambios: Array<{ transaccion: string; estado: EstadoCompra }> = [];
  const repositorio: RepositorioCompras = {
    async insertarSiNueva(compra: CompraNueva): Promise<CompraGuardada | null> {
      if (opciones.fallo === "insertar") throw new Error("fallo simulado");
      insertadas.push(compra);
      const previa = guardadas.get(compra.transaccion);
      if (previa) return { transaccion: compra.transaccion, estado: previa };
      guardadas.set(compra.transaccion, compra.estado);
      return null;
    },
    async cambiarEstado(transaccion, cambio) {
      if (opciones.fallo === "cambiar") throw new Error("fallo simulado");
      cambios.push({ transaccion, estado: cambio.estado });
      guardadas.set(transaccion, cambio.estado);
    },
  };
  return { repositorio, guardadas, insertadas, cambios };
}

function deps(repositorio: RepositorioCompras | undefined, extra: Partial<DepsWebhook> = {}): DepsWebhook {
  return {
    tokenEsperado: TOKEN,
    repositorio,
    ahora: () => new Date("2026-10-19T10:00:00.000Z"),
    ...extra,
  };
}

describe("tokenValido (tiempo constante)", () => {
  it("acepta el token exacto", () => {
    expect(tokenValido(TOKEN, TOKEN)).toBe(true);
  });

  it("rechaza un token distinto de la misma longitud", () => {
    expect(tokenValido("prueba-token-no-reaX", TOKEN)).toBe(false);
  });

  it("rechaza un token de longitud distinta sin lanzar", () => {
    expect(() => tokenValido("corto", TOKEN)).not.toThrow();
    expect(tokenValido("corto", TOKEN)).toBe(false);
    expect(tokenValido(`${TOKEN}-mas-largo`, TOKEN)).toBe(false);
  });

  it("rechaza ausente o vacío", () => {
    expect(tokenValido(undefined, TOKEN)).toBe(false);
    expect(tokenValido(null, TOKEN)).toBe(false);
    expect(tokenValido("", TOKEN)).toBe(false);
  });
});

describe("hashCorreo", () => {
  it("calcula SHA-256 del correo en minúsculas y sin espacios", () => {
    expect(hashCorreo("ana@ejemplo.com")).toBe(HASH_ANA);
    expect(hashCorreo("  Ana@Ejemplo.COM ")).toBe(HASH_ANA);
  });
});

describe("mapearEvento", () => {
  it("mapea compra aprobada, reembolso, cancelación y contracancelación", () => {
    expect(mapearEvento("PURCHASE_APPROVED")).toBe("activa");
    expect(mapearEvento("PURCHASE_REACTIVATED")).toBe("activa");
    expect(mapearEvento("PURCHASE_REFUNDED")).toBe("reembolsada");
    expect(mapearEvento("PURCHASE_CANCELED")).toBe("cancelada");
    expect(mapearEvento("SUBSCRIPTION_CANCELLATION")).toBe("cancelada");
  });

  it("solo una compra activa da acceso", () => {
    expect(daAcceso(mapearEvento("PURCHASE_APPROVED") ?? "cancelada")).toBe(true);
    expect(daAcceso(mapearEvento("PURCHASE_REFUNDED") ?? "cancelada")).toBe(false);
    expect(daAcceso(mapearEvento("PURCHASE_CANCELED") ?? "cancelada")).toBe(false);
  });

  it("ignora eventos desconocidos y nombres de propiedades del objeto", () => {
    expect(mapearEvento("EVENTO_QUE_NO_EXISTE")).toBeNull();
    expect(mapearEvento("constructor")).toBeNull();
    expect(mapearEvento("__proto__")).toBeNull();
  });
});

describe("manejarEvento", () => {
  it("responde 503 sin token configurado y no escribe nada", async () => {
    const { repositorio, insertadas } = repositorioFalso();
    const r = await manejarEvento(evento(), cabeceras(TOKEN), deps(repositorio, { tokenEsperado: undefined }));
    expect(r.status).toBe(503);
    expect(insertadas).toHaveLength(0);
  });

  it("responde 503 sin repositorio configurado", async () => {
    const r = await manejarEvento(evento(), cabeceras(TOKEN), deps(undefined));
    expect(r.status).toBe(503);
  });

  it("responde 401 con token ausente, incorrecto o de otra longitud, sin procesar nada", async () => {
    for (const token of [undefined, "malo", `${TOKEN}-extra`]) {
      const { repositorio, insertadas } = repositorioFalso();
      const r = await manejarEvento(evento(), cabeceras(token), deps(repositorio));
      expect(r.status).toBe(401);
      expect(r.cuerpo.error).toBe("token_no_valido");
      expect(insertadas).toHaveLength(0);
    }
  });

  it("responde 400 con JSON inválido", async () => {
    const { repositorio } = repositorioFalso();
    const r = await manejarEvento("{no es json", cabeceras(TOKEN), deps(repositorio));
    expect(r.status).toBe(400);
  });

  it("responde 400 si falta el nombre del evento", async () => {
    const { repositorio } = repositorioFalso();
    const sinEvento = JSON.stringify({ data: { purchase: { transaction: "HP-1" }, buyer: { email: CORREO } } });
    const r = await manejarEvento(sinEvento, cabeceras(TOKEN), deps(repositorio));
    expect(r.status).toBe(400);
  });

  it("responde 400 si falta la transacción o el correo del comprador", async () => {
    const { repositorio } = repositorioFalso();
    const sinTransaccion = JSON.stringify({ event: "PURCHASE_APPROVED", data: { buyer: { email: CORREO } } });
    const sinCorreo = JSON.stringify({ event: "PURCHASE_APPROVED", data: { purchase: { transaction: "HP-1" } } });
    expect((await manejarEvento(sinTransaccion, cabeceras(TOKEN), deps(repositorio))).status).toBe(400);
    expect((await manejarEvento(sinCorreo, cabeceras(TOKEN), deps(repositorio))).status).toBe(400);
  });

  it("responde 413 a un cuerpo demasiado grande", async () => {
    const { repositorio } = repositorioFalso();
    const enorme = "x".repeat(70 * 1024);
    const r = await manejarEvento(enorme, cabeceras(TOKEN), deps(repositorio));
    expect(r.status).toBe(413);
  });

  it("responde 200 ignorado a un evento que no cambia el acceso, sin escribir", async () => {
    const { repositorio, insertadas } = repositorioFalso();
    const r = await manejarEvento(evento("PURCHASE_BILLET_PRINTED"), cabeceras(TOKEN), deps(repositorio));
    expect(r.status).toBe(200);
    expect(r.cuerpo.resultado).toBe("ignorado");
    expect(insertadas).toHaveLength(0);
  });

  it("guarda la compra aprobada con el hash del correo y sin el correo en claro", async () => {
    const { repositorio, insertadas, guardadas } = repositorioFalso();
    const r = await manejarEvento(evento(), cabeceras(TOKEN), deps(repositorio));
    expect(r.status).toBe(200);
    expect(r.cuerpo.resultado).toBe("registrada");
    expect(insertadas).toEqual([
      {
        transaccion: "HP-PRUEBA-001",
        correo_hash: HASH_ANA,
        evento: "PURCHASE_APPROVED",
        estado: "activa",
        recibido_en: "2026-10-19T10:00:00.000Z",
      },
    ]);
    expect(Object.keys(insertadas[0] ?? {}).sort()).toEqual(
      ["correo_hash", "estado", "evento", "recibido_en", "transaccion"].sort(),
    );
    expect(JSON.stringify(insertadas)).not.toContain("@");
    expect(guardadas.get("HP-PRUEBA-001")).toBe("activa");
  });

  it("idempotencia: un segundo evento igual responde 200 duplicada sin efectos", async () => {
    const { repositorio, insertadas, cambios } = repositorioFalso();
    await manejarEvento(evento(), cabeceras(TOKEN), deps(repositorio));
    const segundo = await manejarEvento(evento(), cabeceras(TOKEN), deps(repositorio));
    expect(segundo.status).toBe(200);
    expect(segundo.cuerpo.resultado).toBe("duplicada");
    expect(insertadas).toHaveLength(2);
    expect(cambios).toHaveLength(0);
  });

  it("un reembolso de una compra ya guardada cambia el estado y responde 200 actualizada", async () => {
    const { repositorio, cambios, guardadas } = repositorioFalso();
    await manejarEvento(evento("PURCHASE_APPROVED"), cabeceras(TOKEN), deps(repositorio));
    const r = await manejarEvento(evento("PURCHASE_REFUNDED"), cabeceras(TOKEN), deps(repositorio));
    expect(r.status).toBe(200);
    expect(r.cuerpo.resultado).toBe("actualizada");
    expect(cambios).toEqual([{ transaccion: "HP-PRUEBA-001", estado: "reembolsada" }]);
    expect(guardadas.get("HP-PRUEBA-001")).toBe("reembolsada");
  });

  it("responde 500 si falla la escritura de la compra (para que Hotmart reintente)", async () => {
    const { repositorio } = repositorioFalso({ fallo: "insertar" });
    const mensajes: string[] = [];
    const r = await manejarEvento(
      evento(),
      cabeceras(TOKEN),
      deps(repositorio, { registrarError: (m) => mensajes.push(m) }),
    );
    expect(r.status).toBe(500);
    expect(r.cuerpo.ok).toBe(false);
    expect(mensajes.join(" ")).not.toContain(TOKEN);
    expect(mensajes.join(" ")).not.toContain("@");
  });

  it("responde 500 si falla el cambio de estado", async () => {
    const { repositorio } = repositorioFalso({
      inicial: { "HP-PRUEBA-001": "activa" },
      fallo: "cambiar",
    });
    const r = await manejarEvento(evento("PURCHASE_REFUNDED"), cabeceras(TOKEN), deps(repositorio));
    expect(r.status).toBe(500);
  });
});
