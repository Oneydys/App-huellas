import type { MetadataRoute } from "next";
import { PLANTILLA } from "@/lib/plantilla";

// Permite añadir la app a la pantalla de inicio del celular y abrirla sin barra del navegador.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${PLANTILLA.nombreApp} — carnet de salud para tu perro o gato`,
    short_name: PLANTILLA.nombreApp,
    description: "Organiza el historial de tu mascota, ve su próximo cuidado y prepara un resumen para el veterinario.",
    lang: "es-419",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: PLANTILLA.colores.fondo,
    theme_color: PLANTILLA.colores.tema,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
