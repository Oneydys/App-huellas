import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { configuracionFaltante, leerSupabase } from "./config";

/**
 * Pruebas de RLS con dos cuentas reales de PRUEBA de tu proyecto de Supabase de desarrollo.
 * Se saltan (skip) si falta alguna variable. Nunca uses tu proyecto de producción.
 *
 * Variables: SUPABASE_URL, SUPABASE_ANON_KEY y, para las dos cuentas de prueba:
 *   PRUEBA_RLS_CORREO_A, PRUEBA_RLS_CLAVE_A, PRUEBA_RLS_CORREO_B, PRUEBA_RLS_CLAVE_B
 * Ejecuta con `npm test`. Vitest no lee .env.local: define las variables en la terminal antes.
 * Crea y borra una mascota de prueba en la cuenta A.
 */

const config = leerSupabase();
const variablesCuentas = ["PRUEBA_RLS_CORREO_A", "PRUEBA_RLS_CLAVE_A", "PRUEBA_RLS_CORREO_B", "PRUEBA_RLS_CLAVE_B"];
const faltan = [
  ...configuracionFaltante("supabase"),
  ...variablesCuentas.filter((nombre) => (process.env[nombre] ?? "").trim() === ""),
];

interface Sesion {
  token: string;
  id: string;
}

async function iniciarSesion(correo: string, clave: string): Promise<Sesion> {
  if (!config) throw new Error("Falta configuración de Supabase.");
  const res = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: config.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: correo, password: clave }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`No se pudo iniciar sesión con una cuenta de prueba (${res.status}).`);
  const datos = (await res.json()) as { access_token: string; user: { id: string } };
  return { token: datos.access_token, id: datos.user.id };
}

describe.skipIf(faltan.length > 0)("RLS con dos cuentas de prueba", () => {
  let a: Sesion;
  let b: Sesion;
  let mascotaId = "";

  // Helper: llamada REST como un usuario concreto (la clave anon + el token del usuario).
  async function rest(
    ruta: string,
    token: string,
    opciones: { metodo?: string; cuerpo?: unknown; representacion?: boolean } = {},
  ): Promise<Response> {
    if (!config) throw new Error("Falta configuración de Supabase.");
    const cabeceras: Record<string, string> = {
      apikey: config.anonKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    if (opciones.representacion) cabeceras.Prefer = "return=representation";
    return fetch(`${config.url}/rest/v1/${ruta}`, {
      method: opciones.metodo ?? "GET",
      headers: cabeceras,
      body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
      cache: "no-store",
    });
  }

  beforeAll(async () => {
    a = await iniciarSesion(process.env.PRUEBA_RLS_CORREO_A ?? "", process.env.PRUEBA_RLS_CLAVE_A ?? "");
    b = await iniciarSesion(process.env.PRUEBA_RLS_CORREO_B ?? "", process.env.PRUEBA_RLS_CLAVE_B ?? "");
    const res = await rest("mascotas", a.token, {
      metodo: "POST",
      representacion: true,
      cuerpo: {
        user_id: a.id,
        nombre: "Prueba RLS",
        especie: "perro",
        raza: "",
        nacimiento: "2020-01-01",
        nacimiento_aproximado: true,
        personaje: "prueba-rls",
      },
    });
    const filas = (await res.json()) as Array<{ id: string }>;
    mascotaId = filas[0]?.id ?? "";
  });

  afterAll(async () => {
    if (mascotaId && a) await rest(`mascotas?id=eq.${mascotaId}`, a.token, { metodo: "DELETE" });
  });

  it("la cuenta A ve su propia mascota", async () => {
    expect(mascotaId).not.toBe("");
    const res = await rest(`mascotas?id=eq.${mascotaId}&select=id`, a.token);
    const filas = (await res.json()) as unknown[];
    expect(filas).toHaveLength(1);
  });

  it("la cuenta B no ve la mascota de A", async () => {
    const res = await rest(`mascotas?id=eq.${mascotaId}&select=id`, b.token);
    const filas = (await res.json()) as unknown[];
    expect(filas).toHaveLength(0);
  });

  it("la cuenta B no puede modificar la mascota de A", async () => {
    const res = await rest(`mascotas?id=eq.${mascotaId}`, b.token, {
      metodo: "PATCH",
      representacion: true,
      cuerpo: { nombre: "Cambio ajeno" },
    });
    const filas = (await res.json()) as unknown[];
    expect(filas).toHaveLength(0);

    const despues = (await (await rest(`mascotas?id=eq.${mascotaId}&select=nombre`, a.token)).json()) as Array<{
      nombre: string;
    }>;
    expect(despues[0]?.nombre).toBe("Prueba RLS");
  });

  it("la cuenta B no puede crear una mascota a nombre de A", async () => {
    const res = await rest("mascotas", b.token, {
      metodo: "POST",
      cuerpo: {
        user_id: a.id,
        nombre: "Suplantada",
        especie: "gato",
        raza: "",
        nacimiento: "2020-01-01",
        nacimiento_aproximado: true,
        personaje: "prueba-rls",
      },
    });
    expect(res.ok).toBe(false);
  });

  it("la cuenta B no puede borrar la mascota de A", async () => {
    await rest(`mascotas?id=eq.${mascotaId}`, b.token, { metodo: "DELETE" });
    const res = await rest(`mascotas?id=eq.${mascotaId}&select=id`, a.token);
    const filas = (await res.json()) as unknown[];
    expect(filas).toHaveLength(1);
  });

  it("accesos: cada cuenta solo ve sus propias filas", async () => {
    const res = await rest("accesos?select=user_id", a.token);
    const filas = (await res.json()) as Array<{ user_id: string }>;
    for (const fila of filas) {
      expect(fila.user_id).toBe(a.id);
    }
  });

  it("accesos: un cliente no puede escribir accesos", async () => {
    const res = await rest("accesos", a.token, {
      metodo: "POST",
      cuerpo: { user_id: a.id, plan: "pro", activo: true },
    });
    expect(res.ok).toBe(false);
  });

  it("compras: ningún cliente puede leer ni escribir compras", async () => {
    const lectura = await rest("compras?select=transaccion", a.token);
    const datos = lectura.ok ? ((await lectura.json()) as unknown[]) : [];
    expect(datos).toHaveLength(0);

    const escritura = await rest("compras", a.token, {
      metodo: "POST",
      cuerpo: {
        transaccion: "HP-PRUEBA-RLS",
        correo_hash: "a".repeat(64),
        evento: "PURCHASE_APPROVED",
        estado: "activa",
        recibido_en: new Date().toISOString(),
      },
    });
    expect(escritura.ok).toBe(false);
  });
});
