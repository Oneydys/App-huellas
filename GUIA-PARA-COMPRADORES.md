# Guía para compradores — Peluvet

## Qué recibes

Peluvet es una **app web de demostración y adaptable**, hecha con Next.js, para un carnet de salud de perros y gatos. Incluye:

- Portada, onboarding para crear el carnet de una mascota, planes y acceso.
- Inicio, carnet, calendario, registro de cuidados y peso, resumen para el veterinario, mascotas, orientación de urgencia y tarjeta de mascota perdida.
- Datos de ejemplo para explorar la app, que se pueden quitar.

**Todo funciona con datos locales.** Lo que se guarda queda en el navegador de quien usa la app. La plantilla **no** incluye cobros reales, correo, cuentas de usuario, base de datos, inteligencia artificial, dominio ni despliegue. Esos servicios los conectas tú.

## Cliente ideal y momento ajá

**Cliente ideal:** dueños de perros y gatos que quieren llevar al día las vacunas, las citas y el carnet de su mascota, sin depender de la memoria ni de papeles sueltos.

**Momento ajá:** la persona pone el nombre de su mascota y ve su carnet listo, con ese nombre y su personaje (pantalla «Michi ya tiene carnet»). Es la primera vez que la app se siente suya.

**Compromiso pequeño antes del paywall:** el nombre y la especie (la especie va con el personaje que elige). Esos dos datos personalizan el inicio, el carnet, el QR y el resumen para el veterinario. Lo demás (edad, país, raza, peso y prioridad) afina el calendario y se puede dejar en blanco cuando tiene sentido.

### Pantallas del onboarding

| Pantalla | Propósito | Qué guarda |
| --- | --- | --- |
| Elige a tu compañero | Promesa (carnet de salud en un lugar) y elección de especie con su personaje | Especie y personaje |
| ¿Cómo se llama? | Compromiso: el nombre aparece en el inicio, el carnet y el QR | Nombre |
| «Michi ya tiene carnet» | Momento ajá: el carnet listo con su nombre | Nada todavía |
| ¿Qué edad tiene? | Edad aproximada para calcular cuándo toca cada cuidado | Edad aproximada |
| ¿Cuál es su raza y dónde vive? | Raza (opcional) para el carnet; país para el calendario | Raza y país |
| ¿Cuánto pesa y qué cuidar primero? | Peso (opcional) y cuidado que quiere ver primero | Peso y prioridad |
| Próximo cuidado y «¿Tienes dudas?» | Muestra el primer cuidado con sus datos y responde tres dudas: si es seguro, si tiene tiempo y si no le sirve | Nada |
| Planes | Oferta con el valor ya visto. «Seguir con el plan gratis» siempre está disponible | Plan elegido (simulado) |
| Acceso | Pide solo el correo para entrar. Aquí no se envía ningún correo | Correo, solo en el navegador |

Cada pantalla tiene botón de volver. La raza y el peso se pueden dejar en blanco. El nombre, la especie, la edad aproximada y el país son obligatorios porque el calendario los usa.

## Código QR de identificación

Cada carnet tiene un código QR: aparece en el carnet y en la tarjeta de mascota perdida (la que se imprime). Al escanearlo se abre `/encontrada/<código>` con **solo** el nombre, el personaje y la raza de la mascota, y dice qué hacer: llevarla a una veterinaria o a un refugio y, si la tarjeta tiene un número impreso, llamar a ese número.

- **No lleva datos de contacto ni del dueño:** ni teléfono, ni nombre de quien la cuida, ni nota, ni fecha de nacimiento, ni foto. Los datos viajan en el fragmento del enlace (`#…`), que el navegador no envía al servidor.
- **Funciona desde cualquier teléfono** cuando pones tu dirección pública en `urlSitio` (`lib/plantilla.ts`). Mientras esa marca siga como `[COMPLETAR]`, el QR apunta a la dirección donde se abrió la app: sirve en el mismo equipo o red, pero no fuera de ella.
- **La página no guarda nada y no pide datos.** Para avisar a la familia desde la app hace falta un servidor, que esta plantilla no incluye: la vía de contacto es el número impreso en la tarjeta.
- **Comprobación:** `npm run test:e2e` lee el QR de la tarjeta perdida y del carnet con un lector de QR, abre el enlace en un navegador sin datos y comprueba que el teléfono no aparece.

## Primeros pasos

1. Instala Node.js (versión LTS reciente).
2. Dentro de la carpeta, instala las dependencias:

```bash
npm install
```

3. Arranca la app en tu computadora:

```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) y recorre el flujo: portada, onboarding, planes, acceso y carnet. También puedes pulsar **Ver con datos de demostración**.

## Qué cambiar primero

| Quieres cambiar | Dónde |
| --- | --- |
| Nombre, eslogan y avisos | `lib/plantilla.ts` (sección `textos`) |
| Precios, límites y beneficios Pro | `lib/plantilla.ts` (`precios`, `limites`, `beneficiosPro`) |
| Nombre de la app, título y colores de la barra | `lib/plantilla.ts` (`nombreApp`, `colores`): alimentan el título, el manifest y el `Logotipo` |
| Descripción del sitio | `app/layout.tsx` |
| Dominio público | `urlSitio` en `lib/plantilla.ts` (sin él no se genera el mapa del sitio) |
| Ícono de la pestaña | `app/icon.svg` |
| Textos legales y datos del responsable | `lib/legal.ts` (reemplaza las marcas `[COMPLETAR]`) |
| Ícono de la app instalable | `app/manifest.ts` y `public/icons/` |
| Personajes y su nombre | `lib/personajes.ts` y `public/images/` |
| Colores, tipografía y radios | `app/globals.css` (cambia toda la app: haz una copia antes) |
| Calendarios por país | `lib/calendarios-pais.ts`, solo con fuentes veterinarias verificadas |

Los precios vienen como **sugeridos**: revísalos con tus clientes antes de publicarlos.

**Precios sugeridos: confirma tu oferta en Hotmart antes de vender.** Están en `lib/plantilla.ts` (`precios`): mensual US$2,99 y anual US$29,90 (el anual equivale a 10 mensualidades). Cámbialos aquí y en Hotmart para que coincidan.

## Datos que debes cambiar antes de vender

- **Titular:** `MILLION BUSINESS DIGITAL` en `lib/legal.ts`. Completa el país y la ley aplicable (`[COMPLETAR: país]`) con tus datos.
- **Correo de contacto:** `correo@correo.com` es un **ejemplo**. DEBES cambiarlo por un correo tuyo que vayas a usar con la app (`lib/legal.ts`).
- **Prueba:** `diasPrueba` en `lib/plantilla.ts` (hoy 7 días, ya configurados). Antes de vender, confírmala en Hotmart con estos días, cambia el número o quita la prueba (0) si tu oferta no la incluye. Con 0, la portada y el paywall ocultan la prueba y su botón.
- **Garantía:** `garantia.garantiaDias` en `lib/plantilla.ts` viene en 15 días y se muestra en la portada y el paywall. Si cambias el plazo en Hotmart, cambia también ese valor.

## Cobro, prueba, garantía y reembolso

- **Cobro y reembolso: Hotmart.** Todo se cobra y se reembolsa a través de Hotmart. La plantilla no cobra: `iniciarSuscripcion` es una simulación local (ver "Antes de conectar servicios reales").
- **Garantía de 15 días.** Está en `lib/plantilla.ts` (`garantia.garantiaDias: 15`). Cada mención dice «Garantía de 15 días». Si cambias el plazo en Hotmart, cambia también ese valor. Dentro de esos días, la solicitud de reembolso se gestiona con Hotmart: la plantilla no tiene un proceso propio.
- **Precios y prueba:** los precios (`precios`) y la prueba de 7 días (`precios.diasPrueba`) son sugeridos. Confirma en Hotmart cada precio, la prueba y la garantía antes de vender.
- **Cancelación.** La app no tiene una opción para cancelar Pro: las cancelaciones de suscripción se gestionan con Hotmart. No escribas «cancelas cuando quieras» hasta que lo confirmes en tu cuenta de Hotmart.
- **Textos legales.** La sección «Cobro, prueba y reembolso» de los términos (`lib/legal.ts`) describe ese reparto. Revísala con tu asesor.

## Medir la portada con el píxel de Meta

La plantilla no carga scripts de Meta ni de otros terceros. Prepara la medición así:

- Cada CTA de la portada tiene un `id` estable (`cta-inicio-arriba`, `cta-inicio-medio`, `cta-inicio-final` y `cta-inicio-fija` en la barra inferior) y `data-evento="inicio-compra"`. El botón «Ver con datos de demostración» (`cta-ver-demo`) usa `data-evento="ver-demostracion"` y no es una compra.
- **ViewContent:** envíalo al cargar la portada.
- **InitiateCheckout:** envíalo al hacer clic en un elemento con `data-evento="inicio-compra"`. Con un solo listener:

```js
document.addEventListener("click", (e) => {
  const cta = e.target.closest('[data-evento="inicio-compra"]');
  if (cta) fbq("track", "InitiateCheckout", { content_name: cta.id });
});
```

- Carga el píxel tú, con tu cuenta de Meta: `fbq` solo existe si lo añades.
- El primer clic lleva a crear el carnet, que es gratis. Así, `InitiateCheckout` mide el inicio del recorrido, no una compra. Si prefieres medir solo la elección de plan, mueve `data-evento` a los botones del paywall.

## Antes de conectar servicios reales

Cada punto de conexión tiene una implementación local que puedes reemplazar sin tocar las pantallas:

- **Acceso:** `solicitarAcceso` en `lib/servicios.ts` sigue siendo local. El inicio de sesión con Supabase aún no está conectado en la pantalla de acceso (ver "Lo que sigue pendiente").
- **Control de acceso a `/app`:** `proxy.ts` y `lib/backend/acceso.ts`. Sin variables de Supabase, `/app` funciona igual que en la demo. Con ellas, exige una sesión válida y un acceso activo, así que **no definas esas variables en producción hasta cablear el inicio de sesión**: si no, todos serán redirigidos a `/acceso`.
- **Planes y cobros:** `iniciarSuscripcion` en `lib/servicios.ts`. Pon `modoSimulacion` en `false` en `lib/plantilla.ts` solo cuando el cobro esté conectado, y revisa cada texto que diga "simulación".
- **Datos:** `lib/store/store.ts`. Conserva la forma de `EstadoApp` al cambiar el almacén.
- **Página de contacto para quien encuentra una mascota:** hoy solo lee datos del navegador de quien creó el carnet. Para que funcione desde cualquier teléfono, sírvela desde tu servidor. Mientras tanto, la tarjeta imprimible se usa con el teléfono impreso.

Antes de recibir datos reales de personas o mascotas, necesitas **política de privacidad, términos de uso y una revisión de seguridad**. La plantilla incluye borradores de las tres páginas legales (`/legal/privacidad`, `/legal/terminos` y `/legal/cookies`, con textos en `lib/legal.ts`). Reemplaza las marcas `[COMPLETAR]` y revísalos con tu asesor legal.

## Orden para conectar servicios reales (pendiente)

El kit de backend (Supabase y Hotmart) está escrito, pero **inactivo** hasta que definas sus variables. Sigue este orden y no avances sin cerrar el paso anterior:

1. **Base de datos y cuentas:** aplica `supabase/migrations/0001_nucleo.sql` primero en un proyecto de prueba (ver "Conexiones"). Comprueba RLS con dos cuentas de prueba. La clave de servicio se queda en el servidor.
2. **Cobros:** define `HOTMART_HOTTOK`, prueba el webhook con un evento de prueba y verifica los nombres de evento de Hotmart marcados `[VERIFICAR]` en `lib/backend/hotmart.ts`. Pon `modoSimulacion` en `false` solo cuando el cobro esté probado.
3. **Inicio de sesión y acceso:** conecta el inicio de sesión de Supabase en la pantalla de acceso, guarda el token en la cookie `huellas-sesion` y enlaza cada compra con su cuenta. Hasta cerrar este paso, no definas las variables de Supabase en producción.
4. **Correo:** remitente y plantillas propias; ningún dato personal en respuestas públicas.
5. **Página de contacto para quien encuentra una mascota:** sírvela desde el servidor con un código de al menos 128 bits que no se derive del id interno, límite de intentos y el consentimiento explícito de la familia para mostrar su teléfono.
6. **Textos y avisos:** actualiza `lib/legal.ts` y los avisos de simulación de `lib/plantilla.ts` a lo que la app haga de verdad.

## Límites que debes mantener

- La app organiza información y orienta de forma conservadora. **No diagnostica, no receta y no reemplaza al veterinario.** No la presentes como si lo hiciera.
- No uses la culpa ni el miedo para retener clientes o cobrar.
- No muestres un calendario por país como oficial hasta que esté verificado con fuentes.
- No prometas funciones que la app no tenga (recordatorios, avisos por correo, sincronización, pagos) hasta que existan de verdad.
- Los intervalos de `lib/reglas-genericas.ts` y los umbrales de edad de `lib/mascota.ts` están marcados `[VERIFICAR: fuente]`. Confírmalos con un profesional de salud animal antes de publicar. La app no reemplaza su criterio.

## Comprobar antes de entregar

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

`npm test` pasa sin datos tuyos. Antes de publicar, ejecuta el gate:

```bash
npm run verificar
```

Las pruebas de recorrido y accesibilidad (E2E) recorren el flujo a 375 px y revisan la portada, el onboarding y las páginas legales. La primera vez instala el navegador de pruebas:

```bash
npx playwright install chromium
npm run test:e2e
```

Si cambias el recorrido o los textos clave, actualiza esas pruebas. Las pruebas E2E usan el puerto 3505 (ver `playwright.config.ts`).

## Conexiones

Peluvet trae el kit de backend **inactivo**. Se activa solo con variables de entorno. Sin ellas, la app sigue en demo: el webhook responde `503` y `/app` no cambia.

### Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores. El archivo `.env.local` no se sube a git. Empieza con un proyecto de Supabase de **prueba**.

`npm run dev` lee `.env.local`, pero **`npm test` y `npm run verificar` no**: Vitest no carga ese archivo. Para esos dos comandos, define las variables en la terminal antes de ejecutarlos. En PowerShell: `$env:SUPABASE_URL = "https://tu-proyecto-de-prueba.supabase.co"`. En bash o zsh: `export SUPABASE_URL="https://tu-proyecto-de-prueba.supabase.co"`. Repite con cada variable.

| Variable | Para qué | Dónde la obtienes |
| --- | --- | --- |
| `SUPABASE_URL` | Dirección de tu proyecto de Supabase. | Ajustes del proyecto > API en Supabase |
| `SUPABASE_ANON_KEY` | Clave pública de Supabase. El servidor la usa para verificar la sesión. | Ajustes del proyecto > API en Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio. Salta RLS, así que solo la usa el servidor. Nunca la pongas con `NEXT_PUBLIC_`. | Ajustes del proyecto > API en Supabase |
| `HOTMART_HOTTOK` | Token que confirma que un aviso viene de Hotmart. | Configuración del webhook en Hotmart [VERIFICAR: ubicación exacta] |

Las variables `PRUEBA_RLS_*` de `.env.example` solo sirven para las pruebas de RLS, con dos cuentas de prueba.

### Conexiones

| Conexión | Variables | Qué activa |
| --- | --- | --- |
| `supabase` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | El control de acceso de `/app` y el registro de compras. |
| `hotmart` | `HOTMART_HOTTOK`, más Supabase para guardar las compras | El webhook de `/api/hotmart/webhook`. |
| `resend` | Sin kit | No aplica: Peluvet no envía correos. |

El bloque `conexiones` de `lib/plantilla.ts` ya no decide el gate. `npm run verificar` comprueba las variables de arriba y falla, con sus nombres, mientras falte alguna. También falla mientras queden marcas `[COMPLETAR]` o `[VERIFICAR]`.

### Aplicar la migración

1. En tu proyecto de prueba de Supabase, abre el editor SQL y pega `supabase/migrations/0001_nucleo.sql`. También puedes usar la CLI de Supabase [VERIFICAR: comando según tu versión de la CLI].
2. Crea dos cuentas de prueba en ese proyecto. Define `PRUEBA_RLS_CORREO_A`, `PRUEBA_RLS_CLAVE_A`, `PRUEBA_RLS_CORREO_B` y `PRUEBA_RLS_CLAVE_B` en la terminal, como se explica arriba.
3. Ejecuta `npm test`. Las pruebas de RLS (`lib/backend/rls.test.ts`) se saltan si falta alguna variable.

### Probar el webhook

1. Arranca la app con `npm run dev`, con las variables de prueba en `.env.local`.
2. Envía un evento de prueba. Usa tu token de prueba en lugar del texto de ejemplo, y nunca una compra real:

```bash
curl -X POST http://localhost:3000/api/hotmart/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hotmart-Hottok: TU_TOKEN_DE_PRUEBA" \
  -d '{"event":"PURCHASE_APPROVED","data":{"purchase":{"transaction":"HP-PRUEBA-001"},"buyer":{"email":"prueba@ejemplo.com"}}}'
```

3. Respuestas esperadas: `200` con `"resultado":"registrada"`. Si repites el mismo comando, `200` con `"duplicada"` y sin efectos nuevos. Sin token o con un token incorrecto: `401`. Sin variables: `503`. Si falla la escritura en Supabase: `500`, para que Hotmart reintente.

El nombre de la cabecera del token y la forma del evento deben confirmarse en la documentación de Hotmart [VERIFICAR]. Los nombres de eventos están en `lib/backend/hotmart.ts`.

### Lo que sigue pendiente

- **Inicio de sesión del cliente con Supabase:** no está conectado en la pantalla de acceso. Hasta hacerlo, con las variables definidas, nadie puede tener sesión y `/app` redirige a `/acceso`. El proxy lee el token de la cookie `huellas-sesion`.
- **Enlace entre compra y cuenta:** el webhook guarda un hash del correo en `compras`, pero no crea filas en `accesos`, porque todavía no sabe qué usuario es. Decide cómo y cuándo enlazarlos.
- **Eventos de Hotmart sin confirmar:** los nombres de evento y los campos están marcados `[VERIFICAR]`. Los eventos que no cambian el acceso (por ejemplo, contracargos) responden `200` y se ignoran.
- **Pruebas en servicios reales:** la migración y las pruebas de RLS no se han ejecutado contra un proyecto de Supabase real.

## Lista antes de vender

- [ ] Marca, eslogan, logotipo y colores revisados.
- [ ] Precios y beneficios Pro revisados con tus clientes.
- [ ] Textos y avisos revisados.
- [ ] Recorrido completo probado en celular (375 px) y en escritorio.
- [ ] Datos de demostración quitados o claramente rotulados.
- [ ] Ninguna promesa en pantalla que la app no cumpla.
- [ ] Textos legales revisados con tu asesor y marcas `[COMPLETAR]` reemplazadas (`lib/legal.ts`).
- [ ] Correo de contacto `correo@correo.com` cambiado por uno tuyo (`lib/legal.ts`).
- [ ] Precios, prueba de 7 días y garantía de 15 días confirmados en Hotmart (`lib/plantilla.ts`).
- [ ] Si usas el píxel de Meta: eventos `ViewContent` e `InitiateCheckout` comprobados con su herramienta de prueba.
- [ ] Dominio público configurado (`urlSitio` en `lib/plantilla.ts`). Sin él, el QR del carnet solo se lee en tu red.
- [ ] `npm run verificar` pasa (bloque `conexiones` en `true` donde aplique).
- [ ] Revisión técnica y de seguridad antes de conectar servicios reales.
