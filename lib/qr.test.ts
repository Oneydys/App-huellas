import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { codigoMascota, type Mascota } from "./mascota";
import { baseDeEnlaces, COLORES_QR, datosDeIdentificacion, leerDatosEncontrada, urlEncontrada } from "./qr";

const css = readFileSync(path.resolve("app/globals.css"), "utf8");

const mascota: Mascota = {
  id: "m-1",
  nombre: "Luna",
  especie: "gato",
  personaje: "europeo",
  nacimiento: "2024-01-01",
  nacimientoAproximado: true,
  raza: "",
  pais: "MX",
  prioridad: "vacuna",
  creadaEn: "2026-10-01",
  origen: "usuario",
  contacto: { nombre: "Ana Pérez", telefono: "+52 55 1234 5678", nota: "Es tímida" },
};

describe("datos del QR", () => {
  it("solo lleva nombre, personaje y raza: ni teléfono, ni nombre del dueño, ni nota", () => {
    const datos = datosDeIdentificacion(mascota);
    expect(datos).toEqual({ nombre: "Luna", personaje: "europeo", raza: "Gato mestizo" });
    const url = urlEncontrada("https://ejemplo.com", codigoMascota(mascota.id), datos);
    expect(url).not.toContain("1234");
    expect(url).not.toContain("Ana");
    expect(url).not.toContain("tímida");
  });

  it("el enlace se puede leer de vuelta sin pérdida", () => {
    const datos = datosDeIdentificacion({ ...mascota, raza: "Criollo & más" });
    const url = urlEncontrada("https://ejemplo.com", "HU-0A3K9Z2X1QB", datos);
    const fragmento = url.slice(url.indexOf("#"));
    expect(url).toMatch(/^https:\/\/ejemplo\.com\/encontrada\/HU-0A3K9Z2X1QB#/);
    expect(leerDatosEncontrada(fragmento)).toEqual(datos);
  });

  it("rechaza fragmentos incompletos o con un personaje que no existe", () => {
    expect(leerDatosEncontrada("")).toBeNull();
    expect(leerDatosEncontrada("#nombre=Luna&personaje=dragon&raza=Mestizo")).toBeNull();
    expect(leerDatosEncontrada("#personaje=europeo&raza=Mestizo")).toBeNull();
  });

  it("rechaza nombres demasiado largos", () => {
    const largo = "a".repeat(25);
    expect(leerDatosEncontrada(`#nombre=${largo}&personaje=europeo&raza=Mestizo`)).toBeNull();
  });
});

describe("colores del QR", () => {
  it("son los tokens de marca de app/globals.css", () => {
    expect(css).toContain(`--color-tinta: ${COLORES_QR.oscuro};`);
    expect(css).toContain(`--color-papel: ${COLORES_QR.claro};`);
  });
});

describe("base de los enlaces", () => {
  it("usa el origen actual mientras la dirección pública sea un marcador [COMPLETAR]", () => {
    expect(baseDeEnlaces("http://localhost:3131/")).toBe("http://localhost:3131");
  });
});
