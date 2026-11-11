import type { Metadata, Viewport } from "next";
import "./globals.css";
import { nunito } from "@/lib/fuente";
import { PERSONAJES } from "@/lib/personajes";
import { esMarcador, PLANTILLA } from "@/lib/plantilla";
import { CLAVE_ALMACEN } from "@/lib/store/almacen";

// Antes de cargar la app, el navegador empieza a bajar el personaje de la mascota activa guardada en este
// dispositivo. Así la imagen llega junto al texto y no después de hidratar. Es solo una pista de carga:
// si no hay datos o algo falla, la app sigue igual.
const MAPA_PERSONAJES = Object.fromEntries(PERSONAJES.map((p) => [p.id, p.imagen]));
const PRECARGA_PERSONAJE = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(CLAVE_ALMACEN)})||"null");if(!s||!Array.isArray(s.mascotas))return;var m=s.mascotas.find(function(x){return x.id===s.mascotaActivaId})||s.mascotas[0];if(!m||m.foto)return;var src=${JSON.stringify(MAPA_PERSONAJES)}[m.personaje];if(!src)return;var l=document.createElement("link");l.rel="preload";l.as="image";l.href=src;l.setAttribute("fetchpriority","high");document.head.appendChild(l);}catch(e){}})();`;

const MARCA = PLANTILLA.nombreApp;
const TITULO = `${MARCA} — carnet de salud para tu perro o gato`;
const DESCRIPCION =
  "Organiza el historial de tu mascota, ve su próximo cuidado y prepara un resumen para el veterinario. Plantilla de demostración con datos locales.";

export const metadata: Metadata = {
  // Las imágenes de vista previa necesitan la URL absoluta del sitio. Mientras el comprador no la complete,
  // se usa la misma base local que Next aplica por defecto, pero declarada: así el build no avisa.
  metadataBase: new URL(esMarcador(PLANTILLA.urlSitio) ? "http://localhost:3000" : PLANTILLA.urlSitio),
  applicationName: MARCA,
  title: {
    default: TITULO,
    template: `%s · ${MARCA}`,
  },
  description: DESCRIPCION,
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    siteName: MARCA,
    locale: "es_419",
    type: "website",
  },
  appleWebApp: { capable: true, title: MARCA, statusBarStyle: "default" },
  // Declarar el icono aquí evita que el navegador pida /favicon.ico (no existe) y lo registre como error.
  icons: { icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }], apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: PLANTILLA.colores.tema,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={nunito.variable}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: PRECARGA_PERSONAJE }} />
        {children}
      </body>
    </html>
  );
}
