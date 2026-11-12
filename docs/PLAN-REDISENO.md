# Plan de rediseño de Peluvet

Objetivo: que la app se vea y se sienta como la referencia de estilo (fondo crema cálido, tarjetas
redondeadas con imagen, botones naranjas grandes, chips con icono, barra inferior con pastilla naranja),
sin copiar marca, logo ni fotos de otra app, y sin cambiar la lógica (datos, planes, pruebas).

## Diagnóstico

- Ya hay una base cálida: crema, naranja, Nunito y radios grandes. El cambio es sobre todo de
  **composición**: más aire, cabeceras con saludo, tarjetas con imagen, buscador y chips, y una
  portada con un hero más visual.
- Alcance: 17 rutas, 34 componentes y unas 5.100 líneas de interfaz.
- Reglas que se mantienen (CLAUDE.md): no cambiar la identidad visual sin confirmación, no
  prometer funciones que no existen, textos de salud sin diagnósticos y mínimo 16 px en el texto de
  cuerpo, botones principales de 56 px en móvil.

## Decisiones que necesitamos (antes de la fase 1)

1. **Paleta.** Opción A (recomendada): mantener la de Peluvet, que coincide con el logo. Opción B:
   acercarse al naranja de la referencia; cambia el logo y los colores de marca.
2. **Imágenes.** La referencia usa fotos de mascotas. No tenemos fotos con licencia para todos.
   Opción A (recomendada): personajes ilustrados de la app y foto de la mascota cuando el
   comprador la sube. Opción B: fotos de stock con licencia (costo y verificación de derechos).
3. **Alcance.** Opción A (recomendada): todo, por fases, con una revisión visual al final de cada
   una. Opción B: solo portada e inicio ahora, el resto después.

## Fases

| Fase | Qué se hace | Entregable | Criterio para pasar a la siguiente |
|---|---|---|---|
| 0. Decisiones | Resolver las tres decisiones de arriba y congelar la referencia. | Este documento aprobado. | Decisiones confirmadas. |
| 1. Sistema de diseño | Tokens (espaciados, sombras, radios), botón pastilla, tarjeta con imagen, chip con icono, campo de búsqueda, barra inferior. | Componentes base en `components/ui/` y `app/globals.css`. | Pruebas en verde y componentes revisados en 375 px. |
| 2. Portada | Hero con imagen, sección de beneficios en tarjetas, planes, preguntas y pie. | Portada nueva. | Captura aprobada y pruebas de portada en verde. |
| 3. App: inicio | Saludo, selector de mascotas en chips, tarjeta del carnet, próximo cuidado, barra inferior. | Inicio nuevo. | Recorrido de demostración sin errores. |
| 4. Resto de pantallas | Calendario, carnet, registrar, resumen, perfil, mascotas, urgencia, onboarding, planes, acceso, legales y página de mascota perdida. | Todas las pantallas con el sistema nuevo. | Ninguna pantalla con desbordes ni textos que dejen de leerse. |
| 5. Calidad | Verificación completa (ver abajo). | Informe con capturas. | Todas las verificaciones pasan. |
| 6. Entrega | Actualizar capturas de la portada, la guía y los enlaces de vista previa. | Commits por fase en la rama de trabajo. | Aprobación del dueño. |

## Verificación en cada fase

- `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`.
- Pruebas de navegador (47 casos) con el navegador del entorno.
- Accesibilidad (axe) en modo claro y oscuro. Las pruebas de contraste fallan de vez en cuando por
  las animaciones de entrada; se corrige esperando a que terminen, no quitando la prueba.
- Capturas a 320, 375 y 414 px: sin desbordes horizontales y con la barra inferior visible.
- Comparación visual con la referencia, pantalla por pantalla.

## Riesgos

- **Regresiones:** el cambio es visual, pero toca muchos componentes. Por eso cada fase es un commit
  separado y se puede revertir.
- **Textos de prueba:** algunas pruebas buscan textos exactos; si cambia el copy, se actualizan
  esas pruebas con el texto nuevo, no se quitan.
- **Imágenes:** sin fotos con licencia, el estilo depende de las ilustraciones. Por eso la decisión 2.
- **Capturas de la portada:** se regeneran al final (fase 6), no antes, para no hacerlo dos veces.
