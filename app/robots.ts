import type { MetadataRoute } from "next";

// Lo público (portada, planes y legal) puede indexarse. El carnet privado y la página de
// contacto para quien encuentra una mascota no.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/encontrada/"] },
  };
}
