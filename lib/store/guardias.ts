"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHuellas } from "./hooks";

/** Si todavía no hay ninguna mascota, vuelve al onboarding (primer paso de la ruta). */
export function useRequiereMascota(): void {
  const { listo, estado } = useHuellas();
  const router = useRouter();
  const sinMascotas = estado.mascotas.length === 0;
  useEffect(() => {
    if (listo && sinMascotas) router.replace("/onboarding");
  }, [listo, sinMascotas, router]);
}
