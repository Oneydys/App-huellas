import { expect, test, type Page } from "@playwright/test";

// Móvil de 320 px: la app no desborda y el código del carnet queda dentro de su caja.
test.use({ viewport: { width: 320, height: 568 } });

async function entrarConDemo(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Ver con datos de demostración" }).click();
  await expect(page).toHaveURL(/\/paywall$/);
  await page.getByRole("button", { name: "Seguir con el plan gratis" }).click();
  await page.getByLabel("Tu correo").fill("prueba@ejemplo.com");
  await page.getByRole("button", { name: "Entrar a la app" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

const anchoDocumento = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth);

test("inicio de la app sin desbordes horizontales a 320 px", async ({ page }) => {
  await entrarConDemo(page);
  await expect(page.getByRole("heading", { name: /Próximo cuidado de/ })).toBeVisible();
  expect(await anchoDocumento(page)).toBeLessThanOrEqual(320);
});

test("el código del carnet cabe en su caja a 320 px", async ({ page }) => {
  await entrarConDemo(page);
  await page.goto("/app/carnet");
  await expect(page.getByRole("article", { name: /Carnet digital de/ })).toBeVisible();
  const dentro = await page.evaluate(() => {
    const dd = [...document.querySelectorAll("dd")].find((d) => d.textContent?.startsWith("HU-"));
    if (!dd?.parentElement) return false;
    const texto = dd.getBoundingClientRect();
    const caja = dd.parentElement.getBoundingClientRect();
    return texto.left >= caja.left - 1 && texto.right <= caja.right + 1;
  });
  expect(dentro).toBe(true);
  expect(await anchoDocumento(page)).toBeLessThanOrEqual(320);
});
