import { describe, expect, it } from "vitest";
import { evaluarUrgencia, SENALES } from "./urgencia";

const adulto = { especie: "gato", esCria: false } as const;

describe("orientación de urgencia", () => {
  it("deriva a atención inmediata con cualquier señal grave", () => {
    const r = evaluarUrgencia(["respiracion"], adulto);
    expect(r.nivel).toBe("ahora");
    expect(r.mensaje).toMatch(/veterinario/);
  });

  it("recomienda llamar hoy con señales moderadas", () => {
    expect(evaluarUrgencia(["cojera", "ojo"], adulto).nivel).toBe("hoy");
  });

  it("la señal grave manda aunque haya moderadas", () => {
    expect(evaluarUrgencia(["cojera", "orina"], adulto).nivel).toBe("ahora");
  });

  it("en crías cualquier señal se trata como urgente", () => {
    expect(evaluarUrgencia(["cojera"], { especie: "perro", esCria: true }).nivel).toBe("ahora");
  });

  it("sin señales no descarta nada ni tranquiliza en falso", () => {
    const r = evaluarUrgencia([], adulto);
    expect(r.nivel).toBe("sin-senales");
    expect(r.mensaje).toMatch(/no descarta/);
    expect(`${r.titulo} ${r.mensaje}`).not.toMatch(/no es nada|está bien|no es grave/i);
  });

  it("ignora identificadores desconocidos y nunca receta ni diagnostica", () => {
    expect(evaluarUrgencia(["inventada"], adulto).nivel).toBe("sin-senales");
    for (const s of SENALES) {
      const r = evaluarUrgencia([s.id], adulto);
      expect(`${r.titulo} ${r.mensaje}`).not.toMatch(/dosis|mg|diagnóstico|tiene (parvovirus|moquillo)/i);
    }
  });
});
