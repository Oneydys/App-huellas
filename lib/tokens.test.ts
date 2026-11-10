import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COLOR_OG } from "./og";

// Una sola fuente de verdad para el color: los tokens de app/globals.css. Las imágenes (next/og)
// usan una copia en lib/og.ts que tiene que coincidir, y los componentes no pueden tener hex sueltos.
const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const css = readFileSync(path.join(RAIZ, "app", "globals.css"), "utf8");

function token(nombre: string): string | undefined {
  const patron = new RegExp(`--color-${nombre}:\\s*(#[0-9a-f]{6});`, "i");
  return css.match(patron)?.[1]?.toLowerCase();
}

function archivosTsx(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = path.join(dir, nombre);
    if (statSync(ruta).isDirectory()) return archivosTsx(ruta);
    return nombre.endsWith(".tsx") ? [ruta] : [];
  });
}

describe("tokens de color", () => {
  it.each([
    ["fondo", "fondo"],
    ["papel", "papel"],
    ["hundido", "hundido"],
    ["tinta", "tinta"],
    ["suave", "suave-texto"],
    ["naranjaClaro", "naranja-claro"],
    ["naranjaHondo", "naranja-hondo"],
    ["naranja", "naranja"],
  ] as const)("la imagen usa el mismo %s que el CSS (--color-%s)", (clave, tokenCss) => {
    expect(COLOR_OG[clave].toLowerCase()).toBe(token(tokenCss));
  });

  it("los componentes y las pantallas no tienen colores hexadecimales sueltos", () => {
    const sueltos = [...archivosTsx(path.join(RAIZ, "app")), ...archivosTsx(path.join(RAIZ, "components"))].flatMap((ruta) => {
      const hallazgos = readFileSync(ruta, "utf8").match(/#[0-9a-fA-F]{6}\b/g) ?? [];
      return hallazgos.map((h) => `${path.relative(RAIZ, ruta)}: ${h}`);
    });
    expect(sueltos).toEqual([]);
  });
});
