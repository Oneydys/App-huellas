import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, RUTA_ACCESO, decidirAcceso } from "@/lib/backend/acceso";
import { leerSupabaseAuth } from "@/lib/backend/config";
import { crearDepsAccesoSupabase } from "@/lib/backend/supabase";

/**
 * Control de acceso en el servidor para /app. Sin variables de Supabase no hace nada:
 * la demo sigue como antes. Con ellas:
 * - una sesión real válida con acceso activo entra;
 * - todo lo demás va a /acceso.
 * Con Supabase activo, /demo también redirige a /acceso: no hay demostración ni cookies que la abran.
 * Next 16 usa proxy.ts en lugar de middleware.ts.
 */
export async function proxy(request: NextRequest) {
  const supabase = leerSupabaseAuth();
  if (!supabase) return NextResponse.next();

  // Con Supabase activo no existe la demostración: /demo redirige a acceso real.
  if (request.nextUrl.pathname === "/demo" || request.nextUrl.pathname.startsWith("/demo/")) {
    return NextResponse.redirect(new URL(RUTA_ACCESO, request.nextUrl));
  }

  const token = request.cookies.get(COOKIE_SESION)?.value;
  const decision = await decidirAcceso(token, {
    configurado: true,
    ...crearDepsAccesoSupabase(supabase),
  });

  if (decision === "pasa") return NextResponse.next();
  return NextResponse.redirect(new URL(RUTA_ACCESO, request.nextUrl));
}

export const config = {
  matcher: ["/app", "/app/:path*", "/demo", "/demo/:path*"],
};
