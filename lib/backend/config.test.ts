import { describe, expect, it } from "vitest";
import { configuracionFaltante, conexionActiva, leerHottok, leerSupabase } from "./config";

// Valores ficticios marcados como prueba. No son claves reales.
const COMPLETO = {
  SUPABASE_URL: "https://prueba-proyecto.supabase.co",
  SUPABASE_ANON_KEY: "prueba-anon-no-real",
  SUPABASE_SERVICE_ROLE_KEY: "prueba-servicio-no-real",
  HOTMART_HOTTOK: "prueba-token-no-real",
};

describe("configuración del backend", () => {
  it("sin variables, todas las conexiones están inactivas", () => {
    expect(conexionActiva("supabase", {})).toBe(false);
    expect(conexionActiva("hotmart", {})).toBe(false);
    expect(leerSupabase({})).toBeNull();
    expect(leerHottok({})).toBeNull();
  });

  it("indica con nombres qué variables faltan", () => {
    expect(configuracionFaltante("supabase", {})).toEqual([
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);
    expect(configuracionFaltante("hotmart", {})).toEqual(["HOTMART_HOTTOK"]);
  });

  it("un valor formado solo por espacios cuenta como ausente", () => {
    expect(configuracionFaltante("hotmart", { HOTMART_HOTTOK: "   " })).toEqual(["HOTMART_HOTTOK"]);
  });

  it("con todas las variables válidas, las conexiones están activas", () => {
    expect(conexionActiva("supabase", COMPLETO)).toBe(true);
    expect(conexionActiva("hotmart", COMPLETO)).toBe(true);
    expect(configuracionFaltante("supabase", COMPLETO)).toEqual([]);
  });

  it("devuelve la configuración de Supabase sin barra final en la URL", () => {
    const config = leerSupabase({ ...COMPLETO, SUPABASE_URL: "https://prueba-proyecto.supabase.co/" });
    expect(config).toEqual({
      url: "https://prueba-proyecto.supabase.co",
      anonKey: "prueba-anon-no-real",
      serviceKey: "prueba-servicio-no-real",
    });
  });

  it("acepta http solo para una instancia local de Supabase", () => {
    expect(conexionActiva("supabase", { ...COMPLETO, SUPABASE_URL: "http://127.0.0.1:54321" })).toBe(true);
    expect(conexionActiva("supabase", { ...COMPLETO, SUPABASE_URL: "http://ejemplo.com" })).toBe(false);
  });

  it("una URL mal formada deja la conexión inactiva y nombra la variable", () => {
    expect(configuracionFaltante("supabase", { ...COMPLETO, SUPABASE_URL: "no-es-una-url" })).toEqual([
      "SUPABASE_URL",
    ]);
  });
});
