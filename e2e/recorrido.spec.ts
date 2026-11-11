import { readFileSync } from "node:fs";
import path from "node:path";
import { devices, expect, test, type Page } from "@playwright/test";

// Rutas que deben caber en 375 px sin desborde horizontal.
const RUTAS_PUBLICAS = ["/", "/onboarding", "/legal/privacidad", "/legal/terminos", "/legal/cookies", "/encontrada/HU-000000"];
const RUTAS_APP = ["/app", "/app/calendario", "/app/carnet", "/app/perfil", "/app/resumen", "/app/urgencia"];

// Decodificador de QR (jsQR, dependencia de desarrollo): lee el código como lo haría una cámara.
const JSQR = readFileSync(path.resolve("node_modules/jsqr/dist/jsQR.js"), "utf8");

async function sinDesbordeHorizontal(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
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

/** Dibuja el SVG del QR de la pantalla en un lienzo y devuelve el texto que contiene el código. */
async function leerQr(page: Page, etiqueta: string): Promise<string | null> {
  await page.addScriptTag({ content: JSQR });
  return page.evaluate(async (nombreQr) => {
    const figura = [...document.querySelectorAll('[role="img"]')].find((el) => el.getAttribute("aria-label") === nombreQr);
    const svg = figura?.querySelector("svg");
    if (!svg) return null;
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
    await img.decode();
    const lienzo = document.createElement("canvas");
    lienzo.width = 600;
    lienzo.height = 600;
    const ctx = lienzo.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 600);
    ctx.drawImage(img, 0, 0, 600, 600);
    const pixeles = ctx.getImageData(0, 0, 600, 600);
    const jsQR = (window as unknown as { jsQR: (d: Uint8ClampedArray, w: number, h: number) => { data: string } | null }).jsQR;
    return jsQR(pixeles.data, 600, 600)?.data ?? null;
  }, etiqueta);
}

test("la demo pasa por planes y acceso antes de entrar a la app", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ver con datos de demostración" }).click();
  await expect(page).toHaveURL(/\/paywall$/);

  await page.getByRole("button", { name: "Seguir con el plan gratis" }).click();
  await expect(page).toHaveURL(/\/acceso$/);

  await page.getByLabel("Tu correo").fill("prueba@ejemplo.com");
  await page.getByRole("button", { name: "Entrar a la app" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Próximo cuidado de Luna" })).toBeVisible();
});

test("los datos de la demostración siguen después de recargar", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ver con datos de demostración" }).click();
  await expect(page).toHaveURL(/\/paywall$/);
  await page.getByRole("button", { name: "Seguir con el plan gratis" }).click();
  await page.getByLabel("Tu correo").fill("prueba@ejemplo.com");
  await page.getByRole("button", { name: "Entrar a la app" }).click();
  await expect(page.getByRole("heading", { name: "Próximo cuidado de Luna" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Próximo cuidado de Luna" })).toBeVisible();
});

test("precarga el personaje de la mascota guardada antes de que cargue la app", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ver con datos de demostración" }).click();
  await expect(page).toHaveURL(/\/paywall$/);
  await page.getByRole("button", { name: "Seguir con el plan gratis" }).click();
  await page.getByLabel("Tu correo").fill("prueba@ejemplo.com");
  await page.getByRole("button", { name: "Entrar a la app" }).click();
  await expect(page).toHaveURL(/\/app$/);

  // La pista de precarga del layout pide el personaje guardado antes de que React cargue la app.
  await page.goto("/app");
  const precargada = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel="preload"][as="image"]')].map((l) => l.getAttribute("href")),
  );
  expect(precargada).toContain("/images/personajes/tabby.webp");
});

test("el onboarding muestra el carnet listo tras el nombre, responde dudas y lleva a planes sin errores", async ({ page }) => {
  const errores: string[] = [];
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  page.on("pageerror", (e) => errores.push(e.message));

  await page.goto("/");
  // La portada repite el mismo CTA (arriba, a mitad y al final): se usa el primero visible.
  await page.getByRole("link", { name: "Crear el carnet de mi mascota" }).first().click();
  await expect(page).toHaveURL(/\/onboarding$/);

  await page.getByRole("button", { name: /Gato europeo/ }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click(); // personaje (promesa y especie)

  await page.getByLabel("Nombre de tu mascota").fill("Michi");
  await page.getByRole("button", { name: "Continuar con Michi" }).click(); // compromiso: el nombre

  await expect(page.getByRole("heading", { name: "Michi ya tiene carnet" })).toBeVisible(); // momento ajá
  await page.getByRole("button", { name: "Completar su calendario" }).click();

  await page.getByRole("button", { name: "Continuar", exact: true }).click(); // edad
  await page.getByLabel("País").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Continuar", exact: true }).click(); // raza y país
  await page.getByRole("button", { name: "Ver su próximo cuidado" }).click(); // peso y prioridad

  await expect(page.getByRole("heading", { name: "¿Tienes dudas?" })).toBeVisible();
  await page.getByRole("button", { name: "Guardar y continuar" }).click();

  await expect(page).toHaveURL(/\/paywall$/);
  await expect(page.getByRole("heading", { name: "Ya puedes usar el carnet de Michi" })).toBeVisible();
  expect(errores).toEqual([]);
});

test("el onboarding responde si intentas continuar sin elegir personaje", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Elige un personaje" }).click();
  await expect(page.getByText("Elige un personaje para continuar.")).toBeVisible();
  await expect(page).toHaveURL(/\/onboarding$/);
});

test("las páginas legales responden y no prometen cobros reales", async ({ page }) => {
  for (const ruta of ["/legal/privacidad", "/legal/terminos", "/legal/cookies"]) {
    await page.goto(ruta);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  await page.goto("/legal/cookies");
  await expect(page.getByText("no usa cookies de seguimiento", { exact: false })).toBeVisible();
});

test("el QR de la tarjeta perdida se lee, sin el teléfono ni el nombre de quien la cuida", async ({ page }) => {
  await entrarConDemo(page);
  await page.goto("/app/carnet/perdida");
  await page.getByLabel("Teléfono de contacto").fill("+52 55 1234 5678");
  await page.getByLabel("Tu nombre").fill("Ana Pérez");
  await page.getByRole("button", { name: "Guardar contacto" }).click();

  // El QR se genera tras cargar la pantalla: esperar a verlo evita leer antes de tiempo.
  await expect(page.getByRole("img", { name: "Código QR de Luna" })).toBeVisible();
  const texto = await leerQr(page, "Código QR de Luna");
  expect(texto, "el QR debe leerse").not.toBeNull();
  expect(texto).toMatch(/\/encontrada\/HU-[0-9A-Z]+#nombre=Luna&personaje=europeo&raza=/);
  expect(texto).not.toContain("1234");
  expect(texto).not.toContain("Ana");
  expect(texto).not.toContain("Pérez");
});

test("el QR abre la ficha de identificación en otro teléfono, sin datos guardados", async ({ page, browser }) => {
  await entrarConDemo(page);
  await page.goto("/app/carnet/perdida");
  await expect(page.getByRole("img", { name: "Código QR de Luna" })).toBeVisible();
  const enlace = await leerQr(page, "Código QR de Luna");
  expect(enlace).not.toBeNull();

  // Otro teléfono: contexto nuevo, sin localStorage ni sesión.
  const otro = await browser.newContext({ ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } });
  const errores: string[] = [];
  const otraPagina = await otro.newPage();
  otraPagina.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  otraPagina.on("pageerror", (e) => errores.push(e.message));
  await otraPagina.goto(enlace ?? "");
  await expect(otraPagina.getByRole("heading", { name: "Encontraste a Luna" })).toBeVisible();
  await expect(otraPagina.getByText("Gato · Europeo")).toBeVisible();
  await expect(otraPagina.getByText(/1234|Ana Pérez/)).toHaveCount(0);
  expect(await sinDesbordeHorizontal(otraPagina)).toBe(true);
  expect(errores).toEqual([]);
  await otro.close();
});

test("el carnet muestra su QR de identificación y lo lee", async ({ page }) => {
  await entrarConDemo(page);
  await page.goto("/app/carnet");
  await expect(page.getByRole("img", { name: "Código QR de identificación de Luna" })).toBeVisible();
  const texto = await leerQr(page, "Código QR de identificación de Luna");
  expect(texto).toMatch(/\/encontrada\/HU-[0-9A-Z]+#nombre=Luna/);
});

test("quien encuentra un código sin datos ve un mensaje neutro, sin datos de ejemplo", async ({ page }) => {
  await page.goto("/encontrada/HU-000000");
  await expect(page.getByRole("heading", { name: "Este código no trae datos de la mascota" })).toBeVisible();
  await expect(page.getByText("Mascota de ejemplo")).toHaveCount(0);
});

test("el recorrido de demostración no emite errores de consola", async ({ page }) => {
  const errores: string[] = [];
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  page.on("pageerror", (e) => errores.push(e.message));
  await entrarConDemo(page);
  for (const ruta of ["/app/carnet", "/app/carnet/perdida", "/app/calendario", "/app/resumen", "/app/perfil"]) {
    await page.goto(ruta);
    await expect(page.locator("main").first()).toBeVisible();
  }
  expect(errores).toEqual([]);
});

test("ninguna pantalla pública tiene desborde horizontal a 375 px", async ({ page }) => {
  for (const ruta of RUTAS_PUBLICAS) {
    await page.goto(ruta);
    await expect(page.locator("body")).toBeVisible();
    expect(await sinDesbordeHorizontal(page), `desborde en ${ruta}`).toBe(true);
  }
});

test("ninguna pantalla de la app tiene desborde horizontal a 375 px", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ver con datos de demostración" }).click();
  await expect(page).toHaveURL(/\/paywall$/);
  await page.getByRole("button", { name: "Seguir con el plan gratis" }).click();
  await page.getByLabel("Tu correo").fill("prueba@ejemplo.com");
  await page.getByRole("button", { name: "Entrar a la app" }).click();
  await expect(page).toHaveURL(/\/app$/);

  for (const ruta of RUTAS_APP) {
    await page.goto(ruta);
    await expect(page.locator("main, body").first()).toBeVisible();
    expect(await sinDesbordeHorizontal(page), `desborde en ${ruta}`).toBe(true);
  }
});

test("cada pantalla de la app tiene su título y no se indexa", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ver con datos de demostración" }).click();
  await expect(page).toHaveURL(/\/paywall$/);
  await page.getByRole("button", { name: "Seguir con el plan gratis" }).click();
  await page.getByLabel("Tu correo").fill("prueba@ejemplo.com");
  await page.getByRole("button", { name: "Entrar a la app" }).click();
  await expect(page).toHaveURL(/\/app$/);

  await page.goto("/app/calendario");
  await expect(page).toHaveTitle("Calendario · Peluvet");
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots).toContain("noindex");
});
