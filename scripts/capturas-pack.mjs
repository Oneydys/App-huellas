// Capturas del pack de Huellas: tres pantallas de 390×844 px en JPG, desde el build de producción y con
// reducción de movimiento. Requiere `npm run build` antes. Arranca `next start` en el puerto 3705, guarda su PID
// y lo cierra al terminar. No reutiliza servidores ajenos.
//
// Uso: node scripts/capturas-pack.mjs <carpeta-de-salida>
//
// Los avisos de demostración llevan data-captura="oculto" en la app real. Aquí, y solo aquí, se ocultan con una
// hoja de estilos inyectada antes de capturar. Las cifras de ejemplo de los datos se quedan.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUERTO = 3705;
const ORIGEN = `http://localhost:${PUERTO}`;
const SLUG = "huellas";
const VISTA = { width: 390, height: 844 };
const SALIDA = path.resolve(process.argv[2] ?? path.join(RAIZ, "capturas"));
const OCULTAR = '[data-captura="oculto"] { display: none !important; }';
const PALABRAS_PROHIBIDAS = /demo|ejemplo|demostraci/i;

function puertoOcupado() {
  return new Promise((resolver) => {
    const socket = net.connect(PUERTO, "127.0.0.1");
    socket.once("connect", () => {
      socket.destroy();
      resolver(true);
    });
    socket.once("error", () => resolver(false));
  });
}

function arrancarServidor() {
  const next = path.join(RAIZ, "node_modules", "next", "dist", "bin", "next");
  const salida = [];
  const hijo = spawn(process.execPath, [next, "start", "-p", String(PUERTO)], {
    cwd: RAIZ,
    stdio: ["ignore", "pipe", "pipe"],
  });
  hijo.stdout.on("data", (d) => salida.push(String(d)));
  hijo.stderr.on("data", (d) => salida.push(String(d)));
  hijo.salida = salida;
  return hijo;
}

async function esperarServidor(servidor) {
  const limite = Date.now() + 60_000;
  while (Date.now() < limite) {
    if (servidor.exitCode !== null) throw new Error(`next start terminó: ${servidor.salida.join("").slice(-800)}`);
    try {
      const r = await fetch(`${ORIGEN}/`);
      if (r.ok) return;
    } catch {
      // Todavía arrancando.
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`El servidor no respondió en 60 s: ${servidor.salida.join("").slice(-800)}`);
}

/** Textos visibles dentro del encuadre que contienen una palabra prohibida. Las marcas ocultas no cuentan. */
function palabrasVisibles(page) {
  return page.evaluate((fuente) => {
    const prohibidas = new RegExp(fuente, "i");
    const encontrados = [];
    const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let nodo = recorrido.nextNode(); nodo; nodo = recorrido.nextNode()) {
      const texto = nodo.textContent.trim();
      const el = nodo.parentElement;
      if (!texto || !el || !prohibidas.test(texto)) continue;
      if (el.closest('[data-captura="oculto"]')) continue;
      const estilo = getComputedStyle(el);
      if (estilo.display === "none" || estilo.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
      encontrados.push(texto);
    }
    return encontrados;
  }, PALABRAS_PROHIBIDAS.source);
}

async function capturar(page, sufijo, { listo }) {
  await listo();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.addStyleTag({ content: OCULTAR });
  await page.waitForFunction(() =>
    [...document.images]
      .filter((img) => {
        const r = img.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight;
      })
      .every((img) => img.complete),
  );
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, 0));
  const prohibidas = await palabrasVisibles(page);
  const ruta = path.join(SALIDA, `${SLUG}-${sufijo}.jpg`);
  await page.screenshot({ path: ruta, type: "jpeg", quality: 95, animations: "disabled", caret: "hide" });
  return { archivo: path.basename(ruta), prohibidas };
}

async function main() {
  if (!existsSync(path.join(RAIZ, ".next", "BUILD_ID"))) throw new Error("Falta el build: ejecuta npm run build antes.");
  if (await puertoOcupado()) throw new Error(`El puerto ${PUERTO} ya está en uso; no reutilizo otro servidor.`);
  await mkdir(SALIDA, { recursive: true });

  const servidor = arrancarServidor();
  console.log(`servidor next start pid ${servidor.pid} en ${ORIGEN}`);
  const navegador = await chromium.launch();
  const resultados = [];
  try {
    await esperarServidor(servidor);
    const contexto = await navegador.newContext({
      viewport: VISTA,
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      colorScheme: "light",
      locale: "es-ES",
    });
    try {
      // 1. Primer pliegue de la portada.
      const portada = await contexto.newPage();
      await portada.goto(`${ORIGEN}/`);
      resultados.push(
        await capturar(portada, "1-venta", {
          listo: () => portada.locator("#cta-inicio-arriba").waitFor({ state: "visible" }),
        }),
      );

      // 2. Primera pantalla del onboarding.
      const onboarding = await contexto.newPage();
      await onboarding.goto(`${ORIGEN}/onboarding`);
      resultados.push(
        await capturar(onboarding, "2-onboarding", {
          listo: () => onboarding.getByRole("heading", { name: "Elige a tu compañero" }).waitFor({ state: "visible" }),
        }),
      );

      // 3. Pantalla principal de la app con los datos de ejemplo de la plantilla (entra como en el recorrido de prueba).
      const app = await contexto.newPage();
      await app.goto(`${ORIGEN}/`);
      await app.getByRole("button", { name: "Ver con datos de demostración" }).click();
      await app.waitForURL(/\/paywall$/);
      await app.getByRole("button", { name: "Seguir con el plan gratis" }).click();
      await app.getByLabel("Tu correo").fill("prueba@ejemplo.com");
      await app.getByRole("button", { name: "Entrar a la app" }).click();
      await app.waitForURL(/\/app$/);
      resultados.push(
        await capturar(app, "3-app", {
          listo: () => app.getByRole("heading", { name: "Este mes" }).waitFor({ state: "visible" }),
        }),
      );
    } finally {
      await contexto.close().catch(() => {});
    }
  } finally {
    await navegador.close();
    servidor.kill("SIGTERM");
    console.log(`servidor pid ${servidor.pid} cerrado`);
  }

  let limpias = true;
  for (const r of resultados) {
    const aviso = r.prohibidas.length ? `PALABRAS PROHIBIDAS VISIBLES: ${r.prohibidas.join(" | ")}` : "sin palabras prohibidas visibles";
    if (r.prohibidas.length) limpias = false;
    console.log(`${r.archivo}: ${aviso}`);
  }
  if (!limpias) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
