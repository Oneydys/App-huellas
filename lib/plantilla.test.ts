import { describe, expect, it } from "vitest";
import { esMarcador } from "./plantilla";

describe("marcas de datos por completar", () => {
  it("detecta marcas [COMPLETAR] y no confunde textos normales", () => {
    expect(esMarcador("[COMPLETAR: país]")).toBe(true);
    expect(esMarcador("https://tu-dominio.com")).toBe(false);
  });
});

