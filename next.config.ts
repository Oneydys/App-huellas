import path from "node:path";
import type { NextConfig } from "next";

const desarrollo = process.env.NODE_ENV === "development";

// La app no carga nada de terceros: todo sale de 'self'. Next necesita 'unsafe-inline' para su arranque
// (sin nonce). Solo en desarrollo añade 'unsafe-eval' y el canal de recarga (ws:).
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${desarrollo ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${desarrollo ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// App 100 % local: sin servidor de datos ni caché de componentes.
// `cacheComponents` queda apagado a propósito: la app lee fechas y almacenamiento del
// navegador, y Activity conservaría pantallas ocultas con efectos en pausa.
const nextConfig: NextConfig = {
  // React Compiler (babel-plugin-react-compiler): evita re-renders innecesarios sin useMemo ni useCallback a mano.
  reactCompiler: true,
  // Las imágenes de next/og leen fuentes y el personaje del disco: deben viajar con el despliegue.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./app/_og/*.woff", "./public/images/huellas-mascot.png", "./public/images/peluvet-emblema.png"],
    "/huella-semana/tarjeta": ["./app/_og/*.woff", "./public/images/huellas-mascot.png"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  turbopack: {
    // Fija la raíz del proyecto: si hay un package-lock.json en una carpeta padre, Next no lo confunde.
    root: path.resolve(process.cwd()),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
