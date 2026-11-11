import { describe, expect, it } from "vitest";
import { crearDemo } from "./demo";
import { PLANTILLA, ahorroAnualPorcentaje, formatearPrecio, limiteDeMascotas, textoGarantia, textoGarantiaCorta } from "./plantilla";
import { construirResumen, resumenATexto } from "./resumen";

const HOY = "2026-10-10";

describe("resumen veterinario", () => {
  const demo = crearDemo(HOY);
  const luna = demo.mascotas[0];

  it("reúne solo los registros de la mascota, con sus secciones", () => {
    const r = construirResumen(luna, demo.registros, HOY);
    const titulos = r.secciones.map((s) => s.titulo);
    expect(titulos).toContain("Vacunas registradas");
    expect(titulos).toContain("Peso (últimos registros)");
    const peso = r.secciones.find((s) => s.tipo === "peso");
    expect(peso?.lineas[0]).toContain("4,5 kg");
    const todo = resumenATexto(r);
    expect(todo).not.toContain("Tratamiento de ejemplo"); // el medicamento es de Max
    expect(todo).toContain("Luna");
  });

  it("rotula la demostración y aclara que no diagnostica", () => {
    const texto = resumenATexto(construirResumen(luna, demo.registros, HOY));
    expect(texto).toContain("DATOS DE DEMOSTRACIÓN");
    expect(texto).toContain("No diagnostica");
  });

  it("limita cada sección para que el documento quepa en una página", () => {
    const muchos = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i}`,
      mascotaId: luna.id,
      tipo: "peso" as const,
      fecha: `2026-09-${String(i + 1).padStart(2, "0")}`,
      kg: 4 + i / 10,
      origen: "demo" as const,
      nota: undefined,
    }));
    const peso = construirResumen(luna, muchos, HOY).secciones.find((s) => s.tipo === "peso");
    expect(peso?.lineas).toHaveLength(7);
    expect(peso?.lineas.at(-1)).toMatch(/Y 6 más antiguos/);
  });

  it("indica 'sin registros' cuando una sección está vacía", () => {
    const r = construirResumen(luna, [], HOY);
    expect(r.secciones.find((s) => s.tipo === "vacuna")?.lineas).toEqual(["Sin vacunas registradas."]);
    expect(r.secciones[0].lineas).toContain("Último peso: sin registrar");
  });
});

describe("plantilla editable", () => {
  it("define precios sugeridos dentro del rango de su categoría y los marca para validar (sin nota visible)", () => {
    // Salud o seguimiento personal: mensualidad entre 2,99 y 9,99 USD.
    expect(PLANTILLA.precios.mensual).toBe(2.99);
    expect(PLANTILLA.precios.anual).toBe(29.9);
    expect(PLANTILLA.precios.anual).toBeCloseTo(PLANTILLA.precios.mensual * 10, 6);
    expect(PLANTILLA.precios.diasPrueba).toBe(7);
    expect(PLANTILLA.precios.pendienteDeValidar).toBe(true);
    expect(PLANTILLA.precios).not.toHaveProperty("nota");
  });

  it("formatea precios y calcula un ahorro anual honesto", () => {
    expect(formatearPrecio(2.99)).toBe("US$2,99");
    expect(formatearPrecio(29.9)).toBe("US$29,90");
    expect(ahorroAnualPorcentaje()).toBe(17);
  });

  it("garantía de 15 días en todas las apps y datos propios", () => {
    expect(PLANTILLA.garantia.garantiaDias).toBe(15);
    expect(textoGarantia()).toMatch(/^Garantía de 15 días\./);
    expect(textoGarantia()).toMatch(/Tus datos son tuyos/);
    // La versión corta de la barra fija usa el mismo plazo.
    expect(textoGarantiaCorta()).toMatch(/^Garantía de 15 días ·/);
  });

  it("los límites de mascotas dependen del plan", () => {
    expect(limiteDeMascotas("gratis")).toBe(1);
    expect(limiteDeMascotas("prueba-simulada")).toBe(3);
  });

  it("los textos no prometen cobros, avisos ni cuentas reales", () => {
    const todos = JSON.stringify(PLANTILLA.textos) + JSON.stringify(PLANTILLA.beneficiosPro);
    expect(todos).not.toMatch(/te avisaremos|recibirás un (correo|aviso)|cancela cuando|garantía/i);
    expect(PLANTILLA.textos.avisoSimulacion).toMatch(/no cobra/);
    expect(PLANTILLA.textos.avisoCalendarioGenerico).toMatch(/no lo tomes como oficial/);
    expect(PLANTILLA.textos.avisoOrientativo).toBe("Orientativo, confirma con tu veterinario.");
  });
});
