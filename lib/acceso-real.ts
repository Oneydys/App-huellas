"use client";

import { useEffect, useState } from "react";
import { accesoRealConfigurado } from "@/lib/servicios";

/** true/false cuando ya se sabe si Supabase está activo; null mientras se consulta. */
export function useAccesoRealConfigurado(): boolean | null {
  const [configurado, setConfigurado] = useState<boolean | null>(null);
  useEffect(() => {
    let vigente = true;
    accesoRealConfigurado().then((valor) => {
      if (vigente) setConfigurado(valor);
    });
    return () => {
      vigente = false;
    };
  }, []);
  return configurado;
}

/**
 * Destino de "Continuar con <mascota>". Con Supabase activo, siempre pasa por el acceso real:
 * nunca manda directo a /app. Sin Supabase, se mantiene el comportamiento de la demo.
 * Si aún no se sabe el estado, va a /acceso, que funciona en ambos casos.
 */
export function destinoContinuar(accesoSimulado: boolean, configurado: boolean | null): string {
  if (configurado === false) return accesoSimulado ? "/app" : "/paywall";
  return accesoSimulado ? "/acceso" : "/paywall";
}
