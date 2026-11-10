import { describe, expect, it } from "vitest";
import type { ConfigSupabase } from "./config";
import { manejarEvento, CABECERA_TOKEN_HOTMART } from "./hotmart";
import { crearRepositorioCompras, ErrorSupabase } from "./supabase";

// Valores ficticios marcados como prueba. No son claves reales.
const CONFIG: ConfigSupabase = {
  url: "https://prueba-proyecto.supabase.co",
  anonKey: "prueba-anon-no-real",
  serviceKey: "prueba-servicio-no-real",
};
const TOKEN_HOTMART = "prueba-token-no-real";

type Llamada = { url: string; init: RequestInit };

function fetchSimulado(manejador: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const llamadas: Llamada[] = [];
  const fn = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    llamadas.push({ url, init: init ?? {} });
    return manejador(url, init ?? {});
  }) as unknown as typeof fetch;
  return { fn, llamadas };
}

function json(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json" } });
}

const COMPRA = {
  transaccion: "HP-PRUEBA-010",
  correo_hash: "a".repeat(64),
  evento: "PURCHASE_APPROVED",
  estado: "activa" as const,
  recibido_en: "2026-10-19T10:00:00.000Z",
};

describe("repositorio de compras (PostgREST con fetch simulado)", () => {
  it("inserta con upsert que ignora duplicados y devuelve null si la fila es nueva", async () => {
    const { fn, llamadas } = fetchSimulado(() => json([COMPRA], 201));
    const repo = crearRepositorioCompras(CONFIG, fn);
    expect(await repo.insertarSiNueva(COMPRA)).toBeNull();

    const llamada = llamadas[0];
    expect(llamada?.url).toBe(`${CONFIG.url}/rest/v1/compras?on_conflict=transaccion`);
    const cab = llamada?.init.headers as Record<string, string>;
    expect(cab.Prefer).toContain("resolution=ignore-duplicates");
    expect(cab.Authorization).toBe(`Bearer ${CONFIG.serviceKey}`);
    expect(cab.apikey).toBe(CONFIG.serviceKey);
  });

  it("si la transacción ya existe, lee la compra guardada para comparar el estado", async () => {
    const { fn, llamadas } = fetchSimulado((url) =>
      url.includes("select=") ? json([{ transaccion: COMPRA.transaccion, estado: "reembolsada" }]) : json([], 201),
    );
    const repo = crearRepositorioCompras(CONFIG, fn);
    expect(await repo.insertarSiNueva(COMPRA)).toEqual({ transaccion: COMPRA.transaccion, estado: "reembolsada" });
    expect(llamadas[1]?.url).toContain("transaccion=eq.HP-PRUEBA-010");
  });

  it("lanza ErrorSupabase con solo el código, sin claves ni cuerpo de respuesta", async () => {
    const { fn } = fetchSimulado(() => json({ message: `clave ${CONFIG.serviceKey}` }, 500));
    const repo = crearRepositorioCompras(CONFIG, fn);
    const error = await repo.insertarSiNueva(COMPRA).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ErrorSupabase);
    expect((error as ErrorSupabase).estado).toBe(500);
    expect((error as Error).message).not.toContain(CONFIG.serviceKey);
  });

  it("cambiarEstado usa PATCH con la transacción codificada", async () => {
    const { fn, llamadas } = fetchSimulado(() => new Response(null, { status: 204 }));
    const repo = crearRepositorioCompras(CONFIG, fn);
    await repo.cambiarEstado("HP PRUEBA/011", { estado: "cancelada", evento: "PURCHASE_CANCELED", recibido_en: COMPRA.recibido_en });
    expect(llamadas[0]?.url).toBe(`${CONFIG.url}/rest/v1/compras?transaccion=eq.HP%20PRUEBA%2F011`);
    expect(llamadas[0]?.init.method).toBe("PATCH");
  });

  it("cambiarEstado lanza si Supabase falla", async () => {
    const { fn } = fetchSimulado(() => new Response(null, { status: 503 }));
    const repo = crearRepositorioCompras(CONFIG, fn);
    await expect(
      repo.cambiarEstado("HP-PRUEBA-012", { estado: "activa", evento: "PURCHASE_APPROVED", recibido_en: COMPRA.recibido_en }),
    ).rejects.toBeInstanceOf(ErrorSupabase);
  });
});

describe("webhook completo con el repositorio de Supabase simulado", () => {
  it("responde 500 cuando Supabase falla al guardar, para que Hotmart reintente", async () => {
    const { fn } = fetchSimulado(() => json({ message: "caído" }, 503));
    const mensajes: string[] = [];
    const cuerpo = JSON.stringify({
      event: "PURCHASE_APPROVED",
      data: { purchase: { transaction: "HP-PRUEBA-020" }, buyer: { email: "ana@ejemplo.com" } },
    });
    const r = await manejarEvento(
      cuerpo,
      new Headers({ [CABECERA_TOKEN_HOTMART]: TOKEN_HOTMART }),
      {
        tokenEsperado: TOKEN_HOTMART,
        repositorio: crearRepositorioCompras(CONFIG, fn),
        registrarError: (m) => mensajes.push(m),
      },
    );
    expect(r.status).toBe(500);
    expect(mensajes.join(" ")).not.toContain(CONFIG.serviceKey);
  });

  it("registra una compra nueva con 200 y la fila no contiene el correo en claro", async () => {
    const { fn, llamadas } = fetchSimulado(() => json([{}], 201));
    const cuerpo = JSON.stringify({
      event: "PURCHASE_APPROVED",
      data: { purchase: { transaction: "HP-PRUEBA-021" }, buyer: { email: "ana@ejemplo.com" } },
    });
    const r = await manejarEvento(
      cuerpo,
      new Headers({ [CABECERA_TOKEN_HOTMART]: TOKEN_HOTMART }),
      { tokenEsperado: TOKEN_HOTMART, repositorio: crearRepositorioCompras(CONFIG, fn) },
    );
    expect(r.status).toBe(200);
    expect(r.cuerpo.resultado).toBe("registrada");
    expect(String(llamadas[0]?.init.body)).not.toContain("ana@ejemplo.com");
  });
});
