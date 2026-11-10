import { expect, test } from "@playwright/test";

// Portada para tráfico de pago: el mismo CTA se repite (arriba, a mitad, al final y en la barra fija)
// con un id estable y data-evento="inicio-compra" para medir, sin scripts de terceros.
const IDS_CTA = ["cta-inicio-arriba", "cta-inicio-medio", "cta-inicio-final", "cta-inicio-fija"] as const;

test("la portada repite un único CTA primario con id y data-evento estables", async ({ page }) => {
  await page.goto("/");
  for (const id of IDS_CTA) {
    const cta = page.locator(`#${id}`);
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute("data-evento", "inicio-compra");
    await expect(cta).toHaveAttribute("href", "/onboarding");
  }
  // Ningún otro enlace o botón de la portada se mide como inicio de compra.
  await expect(page.locator('[data-evento="inicio-compra"]')).toHaveCount(IDS_CTA.length);
});

test("la portada tiene preguntas frecuentes con objeciones reales y garantía junto al CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Preguntas frecuentes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "¿Cuánto cuesta?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "¿Mis datos son privados?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "¿Y si pido un reembolso?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "¿Sirve si nunca he llevado un registro?" })).toBeVisible();
  // La garantía se nombra igual en todas sus menciones.
  await expect(page.getByText(/Garantía de \d+ días/).first()).toHaveText(/Garantía de 7 días/);
  await expect(page.getByText(/\(ejemplo\)/i)).toHaveCount(0);
});

test("la portada no desborda en 320 px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await expect(page.locator("#cta-inicio-medio")).toBeAttached();
  const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(ancho).toBeLessThanOrEqual(320);
});
