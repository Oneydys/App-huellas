# Huellas — plantilla Next.js

Carnet de salud digital para perros y gatos (hispanohablantes). **Plantilla de demostración con datos locales:** no cobra, no envía correos ni avisos, no usa base de datos ni IA. Todo se guarda en el navegador (`localStorage`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck && npm run lint && npm test && npm run build
npm run test:e2e   # recorrido y accesibilidad a 375 px (la primera vez: npx playwright install chromium)
```

Puertos: la app de desarrollo usa `localhost:3000`; las pruebas E2E arrancan su propia copia en `localhost:3505` (ver `playwright.config.ts`).

`npm test` pasa sin datos tuyos. El gate de publicación es `npm run verificar`: falla mientras queden marcas `[COMPLETAR]` o `[VERIFICAR]`, datos sin completar o variables de conexión sin definir (Supabase y Hotmart, ver `lib/backend/config.ts`).

Ruta: `/` → `/onboarding` → `/paywall` → `/acceso` → `/app` (Inicio, Calendario, Carnet, Registrar, Resumen, Perfil, Mascotas, Urgencia). La demostración de la portada entra por `/paywall` porque ya trae una mascota.

Para adaptarla paso a paso, lee [GUIA-PARA-COMPRADORES.md](GUIA-PARA-COMPRADORES.md).

## Cobro, garantía y medición

- **Cobro y reembolso: Hotmart.** La demostración no cobra. Cuando conectes Hotmart, los cobros, las cancelaciones y los reembolsos de Pro los gestiona Hotmart.
- **Garantía de 7 días:** `garantia.garantiaDias: 7` en `lib/plantilla.ts`. Cada mención dice «Garantía de 7 días».
- **Precios sugeridos: confirma tu oferta en Hotmart antes de vender.** Están en `lib/plantilla.ts` (mensual US$4,99; anual US$49,90, equivalente a 10 mensualidades), junto con la prueba de 7 días (`precios.diasPrueba`).
- **Medición (píxel de Meta):** cada CTA de la portada tiene `id` y `data-evento="inicio-compra"`. La guía explica cómo enlazar `ViewContent` e `InitiateCheckout`. La plantilla no carga scripts de terceros.

## Qué edita quien compra la plantilla

| Archivo | Para qué |
| --- | --- |
| `lib/plantilla.ts` | Nombre, colores de la marca, dominio (`urlSitio`), precios sugeridos (confírmalos en Hotmart), límites, textos y avisos. `modoSimulacion` en `false` cuando conectes cobros reales. |
| `lib/legal.ts` | Textos legales (privacidad, términos, cookies). Reemplaza las marcas `[COMPLETAR]` y revísalos con tu asesor. |
| `lib/calendarios-pais.ts` | Calendarios sanitarios por país. Vacío a propósito: se completa **solo** tras verificar fuentes veterinarias. |
| `lib/reglas-genericas.ts` | Reglas genéricas y conservadoras del Calendario Vivo. |
| `lib/servicios.ts` | Puntos de conexión (acceso, suscripción) con implementación local. |
| `lib/store/store.ts` | Persistencia local; sustitúyela por tu base de datos conservando `EstadoApp`. |
| `app/globals.css` | Tokens de la identidad visual (colores, tipografía y radios). Cambiarlos afecta toda la app. |

## Límites sanitarios (no negociables)

La app no diagnostica, no receta ni sustituye al veterinario. Las fechas de reglas son orientativas ("confirma con tu veterinario"). La orientación de urgencia solo clasifica señales y deriva a un profesional. El historial y la exportación nunca se bloquean por plan.

