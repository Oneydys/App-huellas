import type { MetadataRoute } from "next";
import { esMarcador, PLANTILLA } from "@/lib/plantilla";

// Solo lo público y sin sesión: el carnet privado y la página de quien encuentra una mascota quedan fuera.
const RUTAS_PUBLICAS = ["/", "/legal/privacidad", "/legal/terminos", "/legal/cookies"];

// Sin dominio configurado no hay URL absolutas que listar: el mapa queda vacío hasta completar urlSitio.
export default function sitemap(): MetadataRoute.Sitemap {
  if (esMarcador(PLANTILLA.urlSitio)) return [];
  return RUTAS_PUBLICAS.map((ruta) => ({ url: new URL(ruta, PLANTILLA.urlSitio).toString() }));
}
