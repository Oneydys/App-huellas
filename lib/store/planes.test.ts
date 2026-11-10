import { describe, expect, it } from "vitest";
import { crearMascota } from "../mascota";
import { estadoVacio, type EstadoApp } from "./estado";
import { planVigente, puedeAgregarMascota } from "./selectores";

const INICIO = "2026-10-01";
const conPrueba = (): EstadoApp => ({ ...estadoVacio(), plan: "prueba-simulada", pruebaIniciadaEn: INICIO });

function propia(id: string): EstadoApp["mascotas"][number] {
  const r = crearMascota(
    { nombre: "Rocky", especie: "perro", personaje: "husky", nacimiento: "2024-01-01", nacimientoAproximado: false, raza: "", pais: "MX", prioridad: "peso" },
    { id, hoy: INICIO },
  );
  if (!r.ok) throw new Error("mascota inválida");
  return r.mascota;
}

describe("planVigente", () => {
  it("el plan gratis siempre es gratis", () => {
    expect(planVigente(estadoVacio(), "2026-10-02")).toBe("gratis");
  });

  it("la prueba simulada sigue activa durante los días de prueba", () => {
    expect(planVigente(conPrueba(), "2026-10-01")).toBe("prueba-simulada");
    expect(planVigente(conPrueba(), "2026-10-07")).toBe("prueba-simulada");
  });

  it("la prueba vence al cumplirse el plazo y vuelve a gratis", () => {
    expect(planVigente(conPrueba(), "2026-10-08")).toBe("gratis");
    expect(planVigente(conPrueba(), "2026-12-01")).toBe("gratis");
  });

  it("sin fecha de inicio no vence (dato incompleto)", () => {
    expect(planVigente({ ...conPrueba(), pruebaIniciadaEn: null }, "2026-12-01")).toBe("prueba-simulada");
  });
});

describe("puedeAgregarMascota con vencimiento de la prueba", () => {
  it("con una mascota propia, la prueba permite agregar otra y vencida no", () => {
    const e: EstadoApp = { ...conPrueba(), mascotas: [propia("x")] };
    expect(puedeAgregarMascota(e, "2026-10-05")).toBe(true);
    expect(puedeAgregarMascota(e, "2026-10-20")).toBe(false);
  });
});
