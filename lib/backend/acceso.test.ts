import { describe, expect, it, vi } from "vitest";
import { decidirAcceso, type DepsAcceso } from "./acceso";
import type { ConfigSupabase } from "./config";
import { crearDepsAccesoSupabase } from "./supabase";

// Valores ficticios marcados como prueba. No son claves reales.
const CONFIG: ConfigSupabase = {
  url: "https://prueba-proyecto.supabase.co",
  anonKey: "prueba-anon-no-real",
  serviceKey: "prueba-servicio-no-real",
};
const TOKEN = "prueba.token.sesion-no-real-1234";
const USUARIO = "3f2b8c1e-9a4d-4e7b-8c2a-1d5e6f7a8b9c";

type Llamada = { url: string; init: RequestInit };

/** fetch simulado: registra cada llamada y responde con el manejador indicado. */
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

function cabecera(init: RequestInit, nombre: string): string | undefined {
  return (init.headers as Record<string, string>)[nombre];
}

describe("decidirAcceso con configuración de Supabase simulada", () => {
  it("sin configuración pasa y no llama a Supabase", async () => {
    const verificarSesion = vi.fn();
    const tieneAccesoActivo = vi.fn();
    const deps: DepsAcceso = { configurado: false, verificarSesion, tieneAccesoActivo };
    expect(await decidirAcceso(undefined, deps)).toBe("pasa");
    expect(await decidirAcceso(TOKEN, deps)).toBe("pasa");
    expect(verificarSesion).not.toHaveBeenCalled();
    expect(tieneAccesoActivo).not.toHaveBeenCalled();
  });

  it("con configuración y sin sesión redirige, sin llamar a Supabase", async () => {
    const { fn, llamadas } = fetchSimulado(() => json({}));
    const deps = { configurado: true, ...crearDepsAccesoSupabase(CONFIG, fn) };
    expect(await decidirAcceso(undefined, deps)).toBe("redirige");
    expect(llamadas).toHaveLength(0);
  });

  it("rechaza un token con formato inválido sin llamar a Supabase", async () => {
    const { fn, llamadas } = fetchSimulado(() => json({}));
    const deps = { configurado: true, ...crearDepsAccesoSupabase(CONFIG, fn) };
    expect(await decidirAcceso("corto", deps)).toBe("redirige");
    expect(await decidirAcceso("con espacios y salto\n-----", deps)).toBe("redirige");
    expect(llamadas).toHaveLength(0);
  });

  it("con token que Supabase rechaza redirige", async () => {
    const { fn, llamadas } = fetchSimulado(() => json({ message: "invalid" }, 401));
    const deps = { configurado: true, ...crearDepsAccesoSupabase(CONFIG, fn) };
    expect(await decidirAcceso(TOKEN, deps)).toBe("redirige");
    expect(llamadas).toHaveLength(1);
    expect(llamadas[0]?.url).toBe(`${CONFIG.url}/auth/v1/user`);
  });

  it("con sesión válida pero sin acceso activo redirige", async () => {
    const { fn, llamadas } = fetchSimulado((url) =>
      url.includes("/auth/v1/user") ? json({ id: USUARIO }) : json([]),
    );
    const deps = { configurado: true, ...crearDepsAccesoSupabase(CONFIG, fn) };
    expect(await decidirAcceso(TOKEN, deps)).toBe("redirige");
    expect(llamadas[1]?.url).toContain("/rest/v1/accesos");
    expect(llamadas[1]?.url).toContain("activo=eq.true");
  });

  it("con sesión válida y acceso activo deja pasar", async () => {
    const { fn, llamadas } = fetchSimulado((url) =>
      url.includes("/auth/v1/user") ? json({ id: USUARIO }) : json([{ user_id: USUARIO }]),
    );
    const deps = { configurado: true, ...crearDepsAccesoSupabase(CONFIG, fn) };
    expect(await decidirAcceso(TOKEN, deps)).toBe("pasa");

    // Las comprobaciones van con el token del usuario, no con la clave de servicio.
    expect(cabecera(llamadas[0]?.init ?? {}, "Authorization")).toBe(`Bearer ${TOKEN}`);
    expect(cabecera(llamadas[0]?.init ?? {}, "apikey")).toBe(CONFIG.anonKey);
    expect(cabecera(llamadas[1]?.init ?? {}, "Authorization")).toBe(`Bearer ${TOKEN}`);
    const todas = JSON.stringify(llamadas.map((l) => l.init));
    expect(todas).not.toContain(CONFIG.serviceKey);
  });

  it("si la red falla, redirige (falla cerrado)", async () => {
    const { fn } = fetchSimulado(() => {
      throw new TypeError("fetch failed");
    });
    const deps = { configurado: true, ...crearDepsAccesoSupabase(CONFIG, fn) };
    expect(await decidirAcceso(TOKEN, deps)).toBe("redirige");
  });

  it("si Supabase responde 500 al leer el acceso, redirige", async () => {
    const { fn } = fetchSimulado((url) =>
      url.includes("/auth/v1/user") ? json({ id: USUARIO }) : json({ message: "error" }, 500),
    );
    const deps = { configurado: true, ...crearDepsAccesoSupabase(CONFIG, fn) };
    expect(await decidirAcceso(TOKEN, deps)).toBe("redirige");
  });

  it("si la sesión no trae un id con formato de uuid, redirige", async () => {
    const { fn, llamadas } = fetchSimulado(() => json({ id: "no-es-uuid" }));
    const deps = { configurado: true, ...crearDepsAccesoSupabase(CONFIG, fn) };
    expect(await decidirAcceso(TOKEN, deps)).toBe("redirige");
    expect(llamadas).toHaveLength(1);
  });
});
