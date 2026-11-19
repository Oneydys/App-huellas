import { describe, expect, it } from "vitest";
import { COOKIE_SESION } from "./acceso";
import type { ConfigSupabase } from "./config";
import { cerrarSesionSupabase, iniciarSesionSupabase, opcionesCookieSesion } from "./sesion";

const config: ConfigSupabase = {
  url: "https://ejemplo.supabase.co",
  anonKey: "clave-publica-de-prueba",
  serviceKey: "clave-de-servicio-de-prueba",
};

function respuesta(estado: number, cuerpo: unknown = {}): typeof fetch {
  return (async () => new Response(JSON.stringify(cuerpo), { status: estado, headers: { "Content-Type": "application/json" } })) as typeof fetch;
}

describe("iniciarSesionSupabase", () => {
  it("con datos correctos devuelve el token y su caducidad", async () => {
    const r = await iniciarSesionSupabase(config, "a@b.com", "clave", respuesta(200, { access_token: "token-valido-123456789012", expires_in: 900 }));
    expect(r).toEqual({ ok: true, token: "token-valido-123456789012", caduca: 900 });
  });

  it("con contraseña incorrecta (400) responde credenciales, sin detalles", async () => {
    const r = await iniciarSesionSupabase(config, "a@b.com", "mal", respuesta(400, { error: "invalid_grant" }));
    expect(r).toEqual({ ok: false, motivo: "credenciales" });
  });

  it("si Supabase falla (500) responde servicio", async () => {
    const r = await iniciarSesionSupabase(config, "a@b.com", "x", respuesta(500));
    expect(r).toEqual({ ok: false, motivo: "servicio" });
  });

  it("si la red falla responde servicio", async () => {
    const roto = (async () => {
      throw new TypeError("sin red");
    }) as typeof fetch;
    const r = await iniciarSesionSupabase(config, "a@b.com", "x", roto);
    expect(r).toEqual({ ok: false, motivo: "servicio" });
  });

  it("si la respuesta no trae token responde servicio", async () => {
    const r = await iniciarSesionSupabase(config, "a@b.com", "x", respuesta(200, { sin: "token" }));
    expect(r).toEqual({ ok: false, motivo: "servicio" });
  });

  it("envía a la ruta de contraseña con la clave pública y el correo", async () => {
    let url = "";
    let cabeceras: Record<string, string> = {};
    let cuerpo = "";
    const espia = (async (u: string, init: RequestInit) => {
      url = u;
      cabeceras = init.headers as Record<string, string>;
      cuerpo = String(init.body);
      return new Response(JSON.stringify({ access_token: "token-valido-123456789012" }), { status: 200 });
    }) as typeof fetch;
    await iniciarSesionSupabase(config, "a@b.com", "clave", espia);
    expect(url).toBe("https://ejemplo.supabase.co/auth/v1/token?grant_type=password");
    expect(cabeceras.apikey).toBe("clave-publica-de-prueba");
    expect(JSON.parse(cuerpo)).toEqual({ email: "a@b.com", password: "clave" });
  });

  it("nunca usa la clave de servicio en el inicio de sesión", async () => {
    let cabeceras: Record<string, string> = {};
    const espia = (async (_u: string, init: RequestInit) => {
      cabeceras = init.headers as Record<string, string>;
      return new Response(JSON.stringify({ access_token: "token-valido-123456789012" }), { status: 200 });
    }) as typeof fetch;
    await iniciarSesionSupabase(config, "a@b.com", "clave", espia);
    expect(Object.values(cabeceras)).not.toContain("clave-de-servicio-de-prueba");
  });
});

describe("cookie de sesión", () => {
  it("usa el nombre huellas-sesion y no se puede leer desde la página", () => {
    expect(COOKIE_SESION).toBe("huellas-sesion");
    const o = opcionesCookieSesion(900, false);
    expect(o.httpOnly).toBe(true);
    expect(o.path).toBe("/");
    expect(o.maxAge).toBe(900);
    expect(o.secure).toBe(false);
  });

  it("en producción la cookie solo viaja por https", () => {
    expect(opcionesCookieSesion(900, true).secure).toBe(true);
  });
});

describe("cerrarSesionSupabase", () => {
  it("pide el cierre local con el token de la sesión y devuelve true", async () => {
    let url = "";
    let cabeceras: Record<string, string> = {};
    const espia = (async (u: string, init: RequestInit) => {
      url = u;
      cabeceras = init.headers as Record<string, string>;
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    const ok = await cerrarSesionSupabase(config, "token-valido-123456789012", espia);
    expect(ok).toBe(true);
    expect(url).toBe("https://ejemplo.supabase.co/auth/v1/logout?scope=local");
    expect(cabeceras.Authorization).toBe("Bearer token-valido-123456789012");
    expect(Object.values(cabeceras)).not.toContain("clave-de-servicio-de-prueba");
  });

  it("si Supabase no responde devuelve false (la cookie se borra igual)", async () => {
    const roto = (async () => {
      throw new TypeError("sin red");
    }) as typeof fetch;
    expect(await cerrarSesionSupabase(config, "token-valido-123456789012", roto)).toBe(false);
  });
});
