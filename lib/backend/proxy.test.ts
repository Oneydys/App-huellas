import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { config as matcher, proxy } from "../../proxy";

// Prueba del cableado de proxy.ts con NextRequest/NextResponse. Valores ficticios de prueba.
const USUARIO = "3f2b8c1e-9a4d-4e7b-8c2a-1d5e6f7a8b9c";
const TOKEN = "prueba.token.sesion-no-real-1234";

const ENTORNO_SUPABASE = {
  SUPABASE_URL: "https://prueba-proyecto.supabase.co",
  SUPABASE_ANON_KEY: "prueba-anon-no-real",
  SUPABASE_SERVICE_ROLE_KEY: "prueba-servicio-no-real",
};

function peticion(ruta: string, cookie?: string): NextRequest {
  const cabeceras: Record<string, string> = {};
  if (cookie) cabeceras.cookie = `huellas-sesion=${cookie}`;
  return new NextRequest(`http://localhost:3000${ruta}`, { headers: cabeceras });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("proxy.ts", () => {
  it("solo se aplica a /app y sus subrutas", () => {
    expect(matcher.matcher).toEqual(["/app", "/app/:path*"]);
  });

  it("sin variables de Supabase deja pasar /app sin llamar a la red", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const fetchEspia = vi.fn();
    vi.stubGlobal("fetch", fetchEspia);

    const respuesta = await proxy(peticion("/app/carnet"));
    expect(respuesta.headers.get("location")).toBeNull();
    expect(respuesta.headers.get("x-middleware-next")).toBe("1");
    expect(fetchEspia).not.toHaveBeenCalled();
  });

  it("con configuración y sin cookie redirige a /acceso", async () => {
    for (const [nombre, valor] of Object.entries(ENTORNO_SUPABASE)) vi.stubEnv(nombre, valor);
    const fetchEspia = vi.fn();
    vi.stubGlobal("fetch", fetchEspia);

    const respuesta = await proxy(peticion("/app"));
    expect(respuesta.status).toBe(307);
    expect(respuesta.headers.get("location")).toBe("http://localhost:3000/acceso");
    expect(fetchEspia).not.toHaveBeenCalled();
  });

  it("con configuración y sesión sin acceso activo redirige a /acceso", async () => {
    for (const [nombre, valor] of Object.entries(ENTORNO_SUPABASE)) vi.stubEnv(nombre, valor);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/auth/v1/user")) {
          return new Response(JSON.stringify({ id: USUARIO }), { status: 200 });
        }
        return new Response(JSON.stringify([]), { status: 200 });
      }),
    );

    const respuesta = await proxy(peticion("/app/mascotas", TOKEN));
    expect(respuesta.headers.get("location")).toBe("http://localhost:3000/acceso");
  });

  it("con configuración y acceso activo deja pasar", async () => {
    for (const [nombre, valor] of Object.entries(ENTORNO_SUPABASE)) vi.stubEnv(nombre, valor);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/auth/v1/user")) {
          return new Response(JSON.stringify({ id: USUARIO }), { status: 200 });
        }
        return new Response(JSON.stringify([{ user_id: USUARIO }]), { status: 200 });
      }),
    );

    const respuesta = await proxy(peticion("/app", TOKEN));
    expect(respuesta.headers.get("location")).toBeNull();
    expect(respuesta.headers.get("x-middleware-next")).toBe("1");
  });
});
