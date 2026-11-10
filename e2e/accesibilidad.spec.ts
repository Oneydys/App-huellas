import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

// Revisión automática con axe-core (WCAG 2.x A y AA): sin fallos serios ni críticos.
// La app no tiene tema oscuro propio (la identidad visual fija el modo claro): en "dark" se comprueba
// que la pantalla sigue siendo legible y sin fallos cuando el sistema pide oscuro.
const AXE = readFileSync(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");
const PUBLICAS = ["/", "/onboarding", "/legal/privacidad", "/legal/terminos", "/legal/cookies", "/encontrada/HU-000000"];
const APP = ["/app", "/app/calendario", "/app/carnet", "/app/carnet/perdida", "/app/perfil", "/app/resumen", "/app/urgencia", "/app/registrar"];

async function axeSinFallos(page: Page) {
  // Espera a que terminen las animaciones de entrada: axe mide contraste sobre opacidades a medio camino.
  // El tope evita quedarse esperando animaciones infinitas (p. ej. esqueletos de carga).
  await page.evaluate(() =>
    Promise.race([
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))),
      new Promise((resolver) => setTimeout(resolver, 1500)),
    ]),
  );
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async () => {
    type Violacion = { id: string; impact?: string | null; nodes: unknown[] };
    const axe = (window as unknown as { axe: { run: (c: Document, o: object) => Promise<{ violations: Violacion[] }> } }).axe;
    const r = await axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] });
    return r.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, impacto: v.impact, nodos: v.nodes.length }));
  });
}

async function entrarConDemo(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Ver con datos de demostración" }).click();
  await expect(page).toHaveURL(/\/paywall$/);
  await page.getByRole("button", { name: "Seguir con el plan gratis" }).click();
  await page.getByLabel("Tu correo").fill("prueba@ejemplo.com");
  await page.getByRole("button", { name: "Entrar a la app" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

for (const esquema of ["light", "dark"] as const) {
  test.describe(`modo ${esquema === "light" ? "claro" : "oscuro del sistema"}`, () => {
    test.use({ colorScheme: esquema });

    for (const ruta of PUBLICAS) {
      test(`axe sin fallos serios ni críticos en ${ruta}`, async ({ page }) => {
        await page.goto(ruta);
        expect(await axeSinFallos(page)).toEqual([]);
      });
    }

    for (const ruta of APP) {
      test(`axe sin fallos serios ni críticos en ${ruta}`, async ({ page }) => {
        await entrarConDemo(page);
        await page.goto(ruta);
        await expect(page.locator("main").first()).toBeVisible();
        expect(await axeSinFallos(page)).toEqual([]);
      });
    }
  });
}
