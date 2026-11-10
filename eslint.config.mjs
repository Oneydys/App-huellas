import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Carpetas de trabajo y utilidades que no forman parte de la app.
    "entrega/**",
    "plantillas-codigo/**",
    "prototipos/**",
    "scripts/**",
    "docs/**",
  ]),
]);

export default eslintConfig;
