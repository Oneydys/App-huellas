import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE_SESION, RUTA_ACCESO } from "@/lib/backend/acceso";
import { leerSupabaseAuth } from "@/lib/backend/config";
import { peticionPermitida } from "@/lib/backend/peticion";
import { cerrarSesionSupabase, iniciarSesionSupabase, opcionesCookieSesion } from "@/lib/backend/sesion";

// Inicio y cierre de sesión del servidor: nunca se guardan en caché.
export const dynamic = "force-dynamic";

const SIN_CACHE = { "Cache-Control": "no-store" };

const cuerpoSchema = z.object({
  correo: z.string().trim().min(1).max(254).email(),
  contrasena: z.string().min(1).max(200),
});

/**
 * Estado del acceso real. No devuelve ninguna clave: solo si Supabase está configurado.
 * La pantalla lo usa para ocultar la demostración cuando el acceso real está activo.
 */
export async function GET() {
  return NextResponse.json({ configurado: leerSupabaseAuth() !== null }, { headers: SIN_CACHE });
}

/**
 * Inicia sesión con correo y contraseña (Supabase Auth). Solo usa la clave pública.
 * Sin configuración responde 503. Peticiones de otros sitios: 403.
 * Nunca registra la contraseña, el token ni el correo.
 */
export async function POST(request: Request) {
  if (!peticionPermitida(request, { exigirJson: true })) {
    return NextResponse.json({ error: "origen" }, { status: 403, headers: SIN_CACHE });
  }

  const config = leerSupabaseAuth();
  if (!config) {
    return NextResponse.json({ error: "no-configurado" }, { status: 503, headers: SIN_CACHE });
  }

  const datos = cuerpoSchema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return NextResponse.json({ error: "datos" }, { status: 400, headers: SIN_CACHE });
  }

  const r = await iniciarSesionSupabase(config, datos.data.correo, datos.data.contrasena);
  if (!r.ok) {
    const estado = r.motivo === "credenciales" ? 401 : 502;
    return NextResponse.json({ error: r.motivo }, { status: estado, headers: SIN_CACHE });
  }

  const produccion = process.env.NODE_ENV === "production";
  const respuesta = NextResponse.json({ ok: true }, { headers: SIN_CACHE });
  respuesta.cookies.set(COOKIE_SESION, r.token, opcionesCookieSesion(r.caduca, produccion));
  return respuesta;
}

/**
 * Cierra sesión: pide a Supabase revocar el token y borra la cookie, aunque Supabase no responda.
 */
export async function DELETE(request: Request) {
  if (!peticionPermitida(request, { exigirJson: false })) {
    return NextResponse.json({ error: "origen" }, { status: 403, headers: SIN_CACHE });
  }

  const produccion = process.env.NODE_ENV === "production";
  const token = cookieDe(request, COOKIE_SESION);
  const config = leerSupabaseAuth();
  let revocado = false;
  if (config && token) revocado = await cerrarSesionSupabase(config, token);

  const respuesta = NextResponse.json({ ok: true, revocado, destino: RUTA_ACCESO }, { headers: SIN_CACHE });
  respuesta.cookies.set(COOKIE_SESION, "", opcionesCookieSesion(0, produccion));
  return respuesta;
}

/** Valor de una cookie leído de la cabecera Cookie de la petición. */
function cookieDe(request: Request, nombre: string): string | undefined {
  const cabecera = request.headers.get("cookie") ?? "";
  for (const parte of cabecera.split(";")) {
    const [clave, ...valor] = parte.trim().split("=");
    if (clave === nombre) return decodeURIComponent(valor.join("="));
  }
  return undefined;
}
