import { describe, expect, it } from "vitest";
import { calcularCalendario } from "./calendario-vivo";
import { datosDelCarnet, datosParaCompartir, textoParaCompartir } from "./compartir";
import { crearDemo } from "./demo";
import { datosDeHechoRapido } from "./hecho-rapido";
import { crearRegistro } from "./registros";

const HOY = "2026-10-10";
const demo = crearDemo(HOY);
const luna = demo.mascotas[0];

describe("compartir el carnet", () => {
  const { propuestas } = calcularCalendario({ mascota: luna, registros: demo.registros, cuidados: demo.cuidados, hoy: HOY });
  const datos = datosDelCarnet(luna, demo.registros, propuestas, HOY);

  it("redacta los datos del carnet con el estado de vacunas según los registros", () => {
    expect(datos.nombre).toBe("Luna");
    expect(datos.peso).toBe("4,5 kg");
    expect(datos.vacunas.estado).toMatch(/según tus registros|Próximo|Pasó/);
    expect(datos.codigo).toMatch(/^HU-/);
  });

  it("al compartir solo salen la mascota y la marca: sin peso, vacunas, código, edad ni país", () => {
    const compartible = datosParaCompartir(luna);
    expect(compartible.nombre).toBe("Luna");
    expect(compartible.linea).not.toMatch(/años|Colombia|kg|HU-/);
    const texto = textoParaCompartir(compartible, true);
    expect(texto).toContain("Carnet de Luna (demostración)");
    expect(texto).toContain("no reemplaza a un veterinario");
    expect(texto).not.toMatch(/peso|kg|vacun|código|HU-|años|\+\d|tel/i);
  });
});

describe("hecho en un toque", () => {
  const { propuestas } = calcularCalendario({ mascota: luna, registros: [], cuidados: [], hoy: HOY });
  const de = (cat: string) => propuestas.find((p) => p.categoria === cat)!;

  it("crea registros válidos sin inventar datos clínicos", () => {
    for (const cat of ["vacuna", "desparasitacion", "visita"]) {
      const datos = datosDeHechoRapido(de(cat), luna.id, HOY);
      expect(datos).not.toBeNull();
      const r = crearRegistro(datos, { id: "r", hoy: HOY });
      expect(r.ok).toBe(true);
    }
    const desp = crearRegistro(datosDeHechoRapido(de("desparasitacion"), luna.id, HOY), { id: "r", hoy: HOY });
    expect(desp.ok && desp.registro.tipo === "desparasitacion" && desp.registro.via).toBe("sin-especificar");
  });

  it("para el peso pide el dato en vez de inventarlo", () => {
    expect(datosDeHechoRapido(de("peso"), luna.id, HOY)).toBeNull();
  });
});
