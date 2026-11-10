import { describe, expect, it } from "vitest";
import {
  codigoMascota,
  crearMascota,
  describirEdad,
  edadEnMeses,
  etapaDeVida,
  nacimientoDesdeEdad,
  razaOMestizo,
  type DatosMascota,
} from "./mascota";

const HOY = "2026-10-10";
const datos: DatosMascota = {
  nombre: "  Luna ",
  especie: "gato",
  personaje: "europeo",
  nacimiento: "2022-08-10",
  nacimientoAproximado: true,
  raza: "",
  pais: "CO",
  prioridad: "vacuna",
};

describe("mascota", () => {
  it("crea una mascota válida y limpia el nombre", () => {
    const r = crearMascota(datos, { id: "m1", hoy: HOY });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.mascota.nombre).toBe("Luna");
      expect(r.mascota.origen).toBe("usuario");
      expect(r.mascota.creadaEn).toBe(HOY);
    }
  });

  it("rechaza nombre vacío, personaje de otra especie y nacimiento futuro", () => {
    const sinNombre = crearMascota({ ...datos, nombre: "   " }, { id: "m1", hoy: HOY });
    expect(sinNombre.ok === false && sinNombre.errores.nombre).toBe("Escribe su nombre.");

    const cruzado = crearMascota({ ...datos, personaje: "beagle" }, { id: "m1", hoy: HOY });
    expect(cruzado.ok).toBe(false);

    const futuro = crearMascota({ ...datos, nacimiento: "2027-01-01" }, { id: "m1", hoy: HOY });
    expect(futuro.ok === false && futuro.errores.nacimiento).toMatch(/futura/);
  });

  it("calcula el nacimiento aproximado y la edad en meses", () => {
    const nac = nacimientoDesdeEdad(4, 2, HOY);
    expect(nac).toBe("2022-08-10");
    expect(edadEnMeses({ nacimiento: nac }, HOY)).toBe(50);
  });

  it("clasifica la etapa de vida con límites claros", () => {
    const en = (meses: number) => etapaDeVida({ nacimiento: nacimientoDesdeEdad(0, meses, HOY) }, HOY);
    expect(en(0)).toBe("cria");
    expect(en(3)).toBe("cria");
    expect(en(4)).toBe("juvenil");
    expect(en(11)).toBe("juvenil");
    expect(en(12)).toBe("adulto");
    expect(en(83)).toBe("adulto");
    expect(en(84)).toBe("mayor");
  });

  it("describe la edad de forma natural", () => {
    const d = (a: number, m: number) => describirEdad({ nacimiento: nacimientoDesdeEdad(a, m, HOY) }, HOY);
    expect(d(0, 0)).toBe("Menos de 1 mes");
    expect(d(0, 1)).toBe("1 mes");
    expect(d(0, 8)).toBe("8 meses");
    expect(d(1, 2)).toBe("1 año y 2 meses");
    expect(d(1, 0)).toBe("1 año");
    expect(d(4, 2)).toBe("4 años");
  });

  it("muestra mestizo cuando no hay raza", () => {
    expect(razaOMestizo({ raza: "", especie: "gato" })).toBe("Gato mestizo");
    expect(razaOMestizo({ raza: "Beagle", especie: "perro" })).toBe("Beagle");
  });

  it("los errores de una mascota incompleta están en español", () => {
    const r = crearMascota({} as DatosMascota, { id: "m1", hoy: HOY });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errores).length).toBeGreaterThan(3);
      for (const mensaje of Object.values(r.errores)) expect(mensaje).not.toMatch(/invalid|expected|received|required/i);
    }
  });

  it("acepta foto y contacto opcionales y rechaza una foto que no es imagen", () => {
    const foto = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
    const ok = crearMascota({ ...datos, foto, contacto: { nombre: "Ana", telefono: "+57 300 000 0000", nota: "" } }, { id: "m1", hoy: HOY });
    expect(ok.ok).toBe(true);
    const mala = crearMascota({ ...datos, foto: "http://ejemplo.com/foto.jpg" }, { id: "m1", hoy: HOY });
    expect(mala.ok === false && mala.errores.foto).toMatch(/foto/i);
    const enorme = crearMascota({ ...datos, foto: `data:image/jpeg;base64,${"A".repeat(200_001)}` }, { id: "m1", hoy: HOY });
    expect(enorme.ok).toBe(false);
  });

  it("el código del carnet es estable, tiene 11 caracteres y no revela datos", () => {
    const c = codigoMascota("m-123");
    expect(c).toBe(codigoMascota("m-123"));
    expect(c).toMatch(/^HU-[0-9A-Z]{11}$/);
    expect(c).not.toBe(codigoMascota("m-124"));
    expect(codigoMascota("m-123-0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d")).toMatch(/^HU-[0-9A-Z]{11}$/);
  });
});
