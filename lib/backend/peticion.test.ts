import { describe, expect, it } from "vitest";
import { peticionPermitida } from "./peticion";

const url = "https://peluvet.ejemplo/api/acceso";

function peticion(cabeceras: Record<string, string>): Request {
  return new Request(url, { method: "POST", headers: { host: "peluvet.ejemplo", ...cabeceras } });
}

describe("peticionPermitida", () => {
  it("acepta JSON desde el mismo sitio", () => {
    expect(peticionPermitida(peticion({ origin: "https://peluvet.ejemplo", "content-type": "application/json" }), { exigirJson: true })).toBe(true);
  });

  it("rechaza un origen de otro sitio", () => {
    expect(peticionPermitida(peticion({ origin: "https://malo.ejemplo", "content-type": "application/json" }), { exigirJson: true })).toBe(false);
  });

  it("rechaza si falta el encabezado Origin", () => {
    expect(peticionPermitida(peticion({ "content-type": "application/json" }), { exigirJson: true })).toBe(false);
  });

  it("acepta el origen cuando el dominio coincide con el encabezado Host (también en local)", () => {
    const local = new Request("http://0.0.0.0:3505/api/acceso", {
      method: "POST",
      headers: { host: "localhost:3505", origin: "http://localhost:3505", "content-type": "application/json" },
    });
    expect(peticionPermitida(local, { exigirJson: true })).toBe(true);
  });

  it("rechaza un formulario simple (text/plain) aunque el origen sea correcto", () => {
    expect(peticionPermitida(peticion({ origin: "https://peluvet.ejemplo", "content-type": "text/plain" }), { exigirJson: true })).toBe(false);
  });

  it("rechaza un formulario HTML (x-www-form-urlencoded)", () => {
    expect(peticionPermitida(peticion({ origin: "https://peluvet.ejemplo", "content-type": "application/x-www-form-urlencoded" }), { exigirJson: true })).toBe(false);
  });

  it("sin exigir JSON (cierre de sesión), basta con el origen correcto", () => {
    expect(peticionPermitida(peticion({ origin: "https://peluvet.ejemplo" }), { exigirJson: false })).toBe(true);
  });
});
