import { describe, expect, it } from "vitest";
import { configuracionFaltante } from "../lib/backend/config";
import { LEGAL } from "../lib/legal";
import { DATOS_PENDIENTES, PLANTILLA } from "../lib/plantilla";

// Gate de publicación: lo ejecuta `npm run verificar`, no `npm test`.
// Falla a propósito mientras queden datos del alumno sin completar o conexiones sin activar.

// Peluvet vende planes Pro (app/paywall). La protección de /app es local hasta conectar Supabase y no es protección real (components/capa-app.tsx).
// Por eso el gate exige Supabase y Hotmart conectados antes de publicar.
// Las conexiones se comprueban con las variables de entorno (lib/backend/config.ts), no con PLANTILLA.conexiones.
const VENDE = true;
const ACCESO_PROTEGIDO = true;

describe("verificar: datos por completar", () => {
  it("no quedan datos del responsable, contacto, país ni dominio", () => {
    expect(DATOS_PENDIENTES, `Completa estos datos: ${DATOS_PENDIENTES.join(" | ")}`).toEqual([]);
  });

  it("no quedan marcas [COMPLETAR] ni [VERIFICAR] en la configuración ni en los textos legales", () => {
    const texto = JSON.stringify({ PLANTILLA, LEGAL });
    expect(texto.match(/\[(COMPLETAR|VERIFICAR)[^\]]*\]/g) ?? []).toEqual([]);
  });
});

describe("verificar: conexiones", () => {
  it("Supabase y Hotmart tienen sus variables de entorno definidas (lib/backend/config.ts)", () => {
    const faltan = [
      ...(ACCESO_PROTEGIDO ? configuracionFaltante("supabase") : []),
      ...(VENDE ? configuracionFaltante("hotmart") : []),
    ];
    expect(
      faltan,
      `Define estas variables de entorno en la terminal antes de ejecutar el gate (ver .env.example y la guía, "Conexiones"): ${faltan.join(", ")}`,
    ).toEqual([]);
  });
});
