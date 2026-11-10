import { describe, expect, it } from "vitest";
import {
  crearRegistro,
  detalleRegistro,
  historialDePeso,
  parsearKg,
  ordenarRecientes,
  pesoActual,
  tituloRegistro,
  ultimoRegistro,
  type Registro,
} from "./registros";

const HOY = "2026-10-10";
const crear = (datos: Record<string, unknown>, id = "r1") => crearRegistro({ mascotaId: "m1", ...datos }, { id, hoy: HOY });

function ok(datos: Record<string, unknown>, id?: string): Registro {
  const r = crear(datos, id);
  if (!r.ok) throw new Error(JSON.stringify(r.errores));
  return r.registro;
}

describe("registros de salud", () => {
  it("crea los seis tipos de registro", () => {
    expect(ok({ tipo: "vacuna", fecha: "2026-09-02", nombre: "Múltiple" }).tipo).toBe("vacuna");
    expect(ok({ tipo: "desparasitacion", fecha: HOY, via: "interna" }).tipo).toBe("desparasitacion");
    expect(ok({ tipo: "peso", fecha: HOY, kg: 4.5 }).tipo).toBe("peso");
    expect(ok({ tipo: "visita", fecha: HOY, motivo: "Control" }).tipo).toBe("visita");
    expect(ok({ tipo: "observacion", fecha: HOY, texto: "Come bien" }).tipo).toBe("observacion");
    expect(ok({ tipo: "medicamento", fecha: HOY, nombre: "Ejemplo", dosis: "Como indicó su veterinario" }).tipo).toBe("medicamento");
  });

  it("valida campos obligatorios con mensajes en español", () => {
    const sinVacuna = crear({ tipo: "vacuna", fecha: HOY, nombre: " " });
    expect(sinVacuna.ok === false && sinVacuna.errores.nombre).toBe("Indica qué vacuna fue.");

    const pesoCero = crear({ tipo: "peso", fecha: HOY, kg: 0 });
    expect(pesoCero.ok === false && pesoCero.errores.kg).toMatch(/mayor que cero/);

    const pesoTexto = crear({ tipo: "peso", fecha: HOY, kg: Number.NaN });
    expect(pesoTexto.ok).toBe(false);

    // Un campo ausente (no solo vacío) también debe dar mensajes en español.
    const ausente = crear({ tipo: "vacuna", fecha: HOY });
    expect(ausente.ok === false && ausente.errores.nombre).toBe("Indica qué vacuna fue.");
    const sinFecha = crearRegistro({ mascotaId: "m1", tipo: "peso", kg: 4 }, { id: "x", hoy: HOY });
    expect(sinFecha.ok === false && sinFecha.errores.fecha).toBe("Escribe una fecha válida.");
    const sinPeso = crear({ tipo: "peso", fecha: HOY });
    expect(sinPeso.ok === false && sinPeso.errores.kg).toBe("Escribe el peso en kilogramos.");

    const tipoRaro = crear({ tipo: "diagnostico", fecha: HOY });
    expect(tipoRaro.ok).toBe(false);
  });

  it("ningún mensaje de error queda en inglés, aunque falten todos los campos", () => {
    for (const tipo of ["vacuna", "desparasitacion", "peso", "visita", "observacion", "medicamento"]) {
      const r = crearRegistro({ mascotaId: "m1", tipo }, { id: "x", hoy: HOY });
      expect(r.ok).toBe(false);
      if (!r.ok) for (const mensaje of Object.values(r.errores)) expect(mensaje).not.toMatch(/invalid|expected|received|required/i);
    }
  });

  it("no permite registrar cuidados en el futuro ni fechas incoherentes", () => {
    const futuro = crear({ tipo: "peso", fecha: "2026-10-11", kg: 4 });
    expect(futuro.ok === false && futuro.errores.fecha).toMatch(/futura/);

    const proxima = crear({ tipo: "vacuna", fecha: "2026-10-01", nombre: "X", proximaFecha: "2026-10-01" });
    expect(proxima.ok === false && proxima.errores.proximaFecha).toBeDefined();

    const fin = crear({ tipo: "medicamento", fecha: "2026-10-05", nombre: "X", fin: "2026-10-01" });
    expect(fin.ok === false && fin.errores.fin).toBeDefined();
  });

  it("ordena del más reciente al más antiguo y encuentra el último de cada tipo", () => {
    const lista = [
      ok({ tipo: "peso", fecha: "2026-08-01", kg: 4.1 }, "a"),
      ok({ tipo: "peso", fecha: "2026-10-01", kg: 4.5 }, "b"),
      ok({ tipo: "vacuna", fecha: "2026-09-02", nombre: "V" }, "c"),
      ok({ tipo: "peso", fecha: "2026-10-01", kg: 4.6 }, "d"),
      { ...ok({ tipo: "peso", fecha: HOY, kg: 9 }, "e"), mascotaId: "otra" },
    ];
    expect(ordenarRecientes(lista).map((r) => r.id)).toEqual(["e", "d", "b", "c", "a"]);
    expect(pesoActual(lista, "m1")?.id).toBe("d");
    expect(ultimoRegistro(lista, "m1", "vacuna")?.id).toBe("c");
    expect(ultimoRegistro(lista, "m1", "visita")).toBeUndefined();
    expect(historialDePeso(lista, "m1").map((r) => r.kg)).toEqual([4.1, 4.5, 4.6]);
  });

  it("muestra títulos y detalles legibles", () => {
    const peso = ok({ tipo: "peso", fecha: HOY, kg: 4.5 });
    expect(tituloRegistro(peso)).toBe("4,5 kg");
    const med = ok({ tipo: "medicamento", fecha: HOY, nombre: "Ejemplo", dosis: "Cada 12 h", fin: "2026-10-20" });
    expect(detalleRegistro(med)).toContain("Indicación: Cada 12 h");
    expect(detalleRegistro(med)).toContain("Hasta 20 de octubre de 2026");
  });

  it("lee pesos escritos con coma, punto o unidad", () => {
    expect(parsearKg("4,5")).toBe(4.5);
    expect(parsearKg(" 12.25 kg ")).toBe(12.25);
    expect(parsearKg("7")).toBe(7);
    expect(parsearKg("")).toBeUndefined();
    expect(parsearKg("abc")).toBeNaN();
    expect(parsearKg("4,555")).toBeNaN();
    expect(parsearKg("-3")).toBeNaN();
  });
});
