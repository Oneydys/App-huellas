import { NextResponse } from "next/server";
import { leerHottok, leerSupabase } from "@/lib/backend/config";
import { manejarEvento } from "@/lib/backend/hotmart";
import { crearRepositorioCompras } from "@/lib/backend/supabase";

// Webhook del servidor: nunca se guarda en caché ni se pre-renderiza.
export const dynamic = "force-dynamic";

/**
 * Recibe eventos de Hotmart. Inactivo (503) hasta definir HOTMART_HOTTOK y las variables de Supabase.
 * La lógica está en lib/backend/hotmart.ts.
 */
export async function POST(request: Request) {
  const supabase = leerSupabase();
  const cuerpo = await request.text();

  const respuesta = await manejarEvento(cuerpo, request.headers, {
    tokenEsperado: leerHottok() ?? undefined,
    repositorio: supabase ? crearRepositorioCompras(supabase) : undefined,
    // Solo se registra un mensaje fijo: nunca el cuerpo, el token ni el correo.
    registrarError: (mensaje) => console.error(mensaje),
  });

  return NextResponse.json(respuesta.cuerpo, {
    status: respuesta.status,
    headers: { "Cache-Control": "no-store" },
  });
}
