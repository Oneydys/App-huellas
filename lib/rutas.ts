import { usePathname } from "next/navigation";

/**
 * Rutas del panel. La demostración vive en /demo y reutiliza las mismas pantallas (reescritura en
 * next.config.ts). /app exige sesión real cuando Supabase está configurado; /demo nunca.
 */
export const BASE_APP = "/app";
export const BASE_DEMO = "/demo";

/** Devuelve /demo si la ruta actual es de la demostración; si no, /app. */
export function baseDelPanel(ruta: string | null): typeof BASE_APP | typeof BASE_DEMO {
  return ruta === BASE_DEMO || (ruta?.startsWith(`${BASE_DEMO}/`) ?? false) ? BASE_DEMO : BASE_APP;
}

/** Base de los enlaces del panel según la ruta en la que está el usuario. */
export function useBaseDelPanel(): typeof BASE_APP | typeof BASE_DEMO {
  return baseDelPanel(usePathname());
}
