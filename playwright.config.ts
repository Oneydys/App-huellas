import { defineConfig, devices } from "@playwright/test";

// Pruebas de recorrido en un teléfono de 375 px. Arranca la app sola en un puerto propio (3505).
// No reutiliza servidores ajenos: otra app en el mismo puerto haría pasar pruebas contra la app equivocada.
// PUERTO permite otro puerto libre (p. ej. PUERTO=3305); por defecto, 3505.
const PUERTO = Number(process.env.PUERTO ?? 3505);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  // El servidor de desarrollo compila cada ruta la primera vez que se visita: con varios trabajadores
  // en paralelo, esa primera navegación puede tardar más de los 5 s por defecto.
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    viewport: { width: 375, height: 812 },
  },
  webServer: {
    command: `npm run dev -- -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
