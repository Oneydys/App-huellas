# Huellas: instrucciones para la IA del alumno

Huellas es una app Next.js de carnet de salud digital para perros y gatos. El alumno la personaliza y la vende. Ruta: `/` → `/onboarding` → `/paywall` → `/acceso` → `/app`.

**Huellas no tiene backend.** Todo se guarda en el navegador (`localStorage`, `lib/store/store.ts`). No hay cuentas, base de datos, cobros, correo, IA ni despliegue reales: hoy ningún servicio está conectado. La guía pide Supabase y Hotmart para publicar; Resend no aplica, porque Huellas no envía correos.

## Qué está hecho y qué no
- Hecho: portada, onboarding, planes, acceso, carnet, calendario, registro de cuidados y peso, resumen, mascotas, urgencia y tarjeta de mascota perdida, con datos de demostración.
- No hecho: cobros (`iniciarSuscripcion` es simulado), acceso real (`solicitarAcceso` solo valida el correo), recordatorios y avisos.
- `/app` no tiene protección real: exige un `accesoSimulado` guardado en el navegador.
- La página de quien encuentra una mascota (`/encontrada/<código>`) muestra el nombre, el personaje y la raza que llegan en el QR. No tiene teléfono ni datos de contacto, y no guarda nada. Para avisar a la familia desde la app hace falta un servidor.
- No prometas en pantalla nada de lo que aparece como "no hecho".

## Marcadores
- `[COMPLETAR]` y `[VERIFICAR]` son datos del alumno o pendientes de verificar. No los inventes ni los rellenes con datos de otro producto.
- Hoy hay `[COMPLETAR]` en `lib/legal.ts` (país) y en `urlSitio` de `lib/plantilla.ts`. El responsable (`MILLION BUSINESS DIGITAL`) y el correo de contacto (`correo@correo.com`, ejemplo que el alumno debe cambiar) ya están puestos.
- Hay `[VERIFICAR: fuente]` en comentarios de `lib/reglas-genericas.ts` y `lib/mascota.ts` (intervalos y umbrales de edad sin fuente veterinaria).

## Cómo conectar
- Sigue `GUIA-PARA-COMPRADORES.md`: "Antes de conectar servicios reales", "Orden para conectar servicios reales" y "Conexiones". Los puntos de conexión están en `lib/servicios.ts`.
- Trabaja con el alumno presente. Pide confirmación antes de cada paso que cree cuentas, cobre, envíe correos o despliegue.
- Una conexión se activa solo con sus variables de entorno (`lib/backend/config.ts`), nunca escribiendo claves ni banderas en el código. Sin variables, la app sigue en demostración.

## Reglas
- Secretos: nunca escribas claves en el código ni en git. No leas ni escribas `.env*`. Las claves secretas nunca llevan `NEXT_PUBLIC_`.
- Base de datos: no cambies migraciones ni reglas RLS sin confirmación explícita. Un cambio nuevo va en una migración nueva.
- Configuración: los cambios de producto van en `lib/plantilla.ts` y los legales en `lib/legal.ts`, no en textos sueltos.
- Salud: la app no diagnostica, no receta y no sustituye al veterinario. No uses la culpa ni el miedo para retener o cobrar. No presentes un calendario por país como oficial sin fuentes verificadas.
- Legal: los textos son borradores. No cites leyes, autoridades ni cifras nuevas; el alumno debe revisarlos con un abogado de su país.

## Verificar antes de dar algo por listo
- `npm run typecheck && npm run lint && npm test && npm run build`.
- `npm run verificar` (gate de publicación) debe pasar antes de publicar. No lo cambies ni lo saltes.
- El gate exige las variables de Supabase y de Hotmart (`lib/backend/config.ts`). Si falla por eso, díselo al alumno: no lo saltes ni lo marques a mano.

## Recomendaciones técnicas y de calidad

**Stack (versiones del lock):**
- Next.js 16.4.2 con Turbopack por defecto (no añadas `--webpack`). React 19.3.1 con React Compiler (`reactCompiler: true` en `next.config.ts`).
- Tailwind CSS 4.3.3 (CSS vía `@tailwindcss/turbopack` en `next.config.ts`). Nunito con `next/font` en `lib/fuente.ts`.
- TypeScript 6.0.3. No subas a TypeScript 7 hasta que `typescript-eslint` lo soporte: hoy rompe ESLint.
- ESLint 10.13.0 con `eslint-config-next` 16.4.2 (flat config en `eslint.config.mjs`). Vitest 5.0.5 (`lib/**/*.test.ts`; el gate en `gate/`). Playwright 1.64.1 (`e2e/`). Zod 4.6.7, lucide-react 1.59.0, qrcode 1.5.4.
- Supabase: sin paquete npm. El kit habla con su API REST desde `lib/backend/supabase.ts`. Si añades `@supabase/supabase-js`, la última versión verificada es 2.118.0 (y `@supabase/ssr` 0.12.7 con Next).
- Node `>=22.18.0` (`engines`). `.nvmrc` con `24`.

**Verificación, en este orden** (en una copia limpia):
1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm test`
5. `npm run build`
6. `npx playwright install chromium` (solo la primera vez) y `npm run test:e2e`. Usa el puerto 3505; si lo ocupa otra app, cámbialo en `playwright.config.ts`.
7. `npm run verificar` (gate). Falla a propósito mientras queden `[COMPLETAR]` o `[VERIFICAR]`, o falten las variables de Supabase y Hotmart. No lo saltes ni lo marques a mano.
8. `npm audit --omit=dev` debe dar 0.

**Conectar servicios** (solo siguiendo `GUIA-PARA-COMPRADORES.md`, secciones "Conexiones" y "Orden para conectar servicios reales"; puntos de conexión en `lib/servicios.ts`):
- Supabase: primero un proyecto de prueba. Variables en `.env.local`, copiado de `.env.example`. Aplica `supabase/migrations/0001_nucleo.sql` en el editor SQL y prueba RLS con dos cuentas de prueba.
- Hotmart: define `HOTMART_HOTTOK` y prueba el webhook con un evento de prueba (ejemplo `curl` en la guía). Confirma los puntos `[VERIFICAR]` en la documentación de Hotmart.
- Resend: no aplica, Huellas no envía correos.
- Vercel y GitHub: la guía aún no los define. No despliegues sin confirmación.
- No definas las variables de Supabase en producción hasta conectar el inicio de sesión (ver "Lo que sigue pendiente" en la guía).
- Antes de cada paso que cree cuentas, cobre, envíe correos o despliegue, pide confirmación al alumno.

**Seguridad:**
- Ninguna clave en el cliente ni en git. La clave de servicio de Supabase solo en el servidor.
- `.env.local` lo escribe el alumno. No lo leas ni lo crees tú.
- RLS activa en toda tabla expuesta (`0001_nucleo.sql` la activa en `accesos`, `compras` y `mascotas`).
- Webhook: token comparado en tiempo constante (`timingSafeEqual` en `lib/backend/hotmart.ts`), idempotencia (un duplicado responde 200 sin efectos) y 5xx cuando falla la escritura, para que Hotmart reintente. Nunca 200 ante un fallo.
- El QR solo lleva nombre, personaje y raza (`lib/qr.ts`). No añadas teléfono ni datos de contacto.

**Migraciones:** no cambies una migración ya aplicada. Cada cambio va en un archivo nuevo en `supabase/migrations/`.

**UX/UI:**
- Respeta la identidad visual de `app/globals.css` (paleta, Nunito, radios). No la cambies sin confirmación.
- Texto de cuerpo de al menos 16 px (`text-cuerpo`). Botones principales de 56 px de alto en móvil (`min-h-14`).
- Mantén el foco visible (`:focus-visible`) y el movimiento reducido (`prefers-reduced-motion` en `globals.css`). Sin desbordes horizontales a 375 px.

**Datos y legal:**
- No inventes datos del titular, país, precios ni contactos. `[COMPLETAR]` y `[VERIFICAR]` los resuelve el alumno.
- Los textos legales son borradores. El alumno los revisa con su abogado.

**Si algo falla:** revisa la prueba que falla y lee el error completo. No borres ni desactives pruebas para pasar, ni apagues reglas de lint sin justificarlo.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
