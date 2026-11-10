import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, RUTA_ACCESO, decidirAcceso } from "@/lib/backend/acceso";
import { leerSupabase } from "@/lib/backend/config";
import { crearDepsAccesoSupabase } from "@/lib/backend/supabase";

/**
 * Control de acceso en el servidor para /app. Sin variables de Supabase no hace nada:
 * la demo sigue como antes. Con ellas, exige sesión y acceso activo (lib/backend/acceso.ts).
 * Next 16 usa proxy.ts en lugar de middleware.ts.
 */
export async function proxy(request: NextRequest) {
  const supabase = leerSupabase();
  if (!supabase) return NextResponse.next();

  const token = request.cookies.get(COOKIE_SESION)?.value;
  const decision = await decidirAcceso(token, {
    configurado: true,
    ...crearDepsAccesoSupabase(supabase),
  });

  if (decision === "pasa") return NextResponse.next();
  return NextResponse.redirect(new URL(RUTA_ACCESO, request.nextUrl));
}

export const config = {
  matcher: ["/app", "/app/:path*"],
};
