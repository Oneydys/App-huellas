/**
 * ═══ VALORES EDITABLES DE LA PLANTILLA ═══
 * Quien compra la plantilla cambia aquí precios, límites y textos legales/avisos.
 * Cuando conectes cobros reales, pon `modoSimulacion` en false y revisa cada texto
 * marcado como "simulación": ya no serán ciertos.
 * Correo de contacto de ejemplo (correo@correo.com): está en lib/legal.ts y DEBES cambiarlo por uno tuyo.
 */
import { LEGAL } from "./legal";

export const PLANTILLA = {
  nombreApp: "Peluvet",
  eslogan: "El carnet de salud de tu perro o gato, siempre contigo",

  /** Dirección pública del sitio, sin barra final. Mientras sea una marca [COMPLETAR], no se genera mapa del sitio. */
  urlSitio: "[COMPLETAR: dominio del sitio, p. ej. https://tu-dominio.com]",

  /** Colores de la app instalable y de la barra del navegador. Deben coincidir con los tokens de app/globals.css. */
  colores: { tema: "#ffa51f", fondo: "#ffe0c8" },

  /** Mientras sea true, la app avisa que cobros, cuentas y avisos son simulaciones locales. */
  modoSimulacion: true,

  // Las conexiones (Supabase, Hotmart) no se activan aquí: se activan con variables de entorno (lib/backend/config.ts).
  // Sin variables, la app sigue en demostración local. Ver GUIA-PARA-COMPRADORES.md, "Conexiones".

  /**
   * Precios sugeridos para una app de salud y seguimiento personal (rango orientativo de 2,99 a 9,99 USD al mes).
   * US$2,99 queda en la parte baja del rango: Pro solo suma mascotas (de 1 a 3) y el plan gratis ya es completo.
   * Regla: el anual equivale a 10 mensualidades (dos meses gratis). Confirma tu oferta en Hotmart antes de vender.
   */
  precios: {
    moneda: "USD",
    mensual: 2.99,
    anual: 29.9,
    /**
     * Prueba de 7 días, ya configurada en la plantilla. Confírmala en Hotmart antes de vender, cambia el número
     * o quita la prueba (0) si tu oferta no la incluye.
     * Con 0, la portada y el paywall ocultan las frases de prueba y el botón de prueba; el plan gratis queda como acción principal.
     */
    diasPrueba: 7,
    /**
     * Indicador interno para el comprador: los precios son sugeridos y conviene validarlos con tus clientes.
     * La portada y el paywall no lo muestran a los visitantes.
     */
    pendienteDeValidar: true,
  },

  /** Límite de mascotas que se pueden agregar (los datos ya guardados nunca se bloquean). */
  limites: { mascotasGratis: 1, mascotasPro: 3 },

  /**
   * Lo que Pro incluye en ESTA plantilla. Solo lo que el código hace hoy: no agregues
   * funciones "próximamente" ni cobres por algo que aún no existe.
   */
  beneficiosPro: [
    {
      titulo: "Hasta 3 mascotas",
      detalle: "El plan gratis incluye 1. Cada mascota tiene su carnet, su calendario y su historial por separado.",
    },
  ],

  /**
   * Garantía junto al botón principal. Se cobra y se reembolsa con Hotmart: la solicitud dentro de
   * `garantiaDias` días se gestiona allí. Cada mención dice «Garantía de N días»; si cambias el plazo
   * en Hotmart, cambia también este valor. La plantilla no tramita reembolsos por su cuenta.
   */
  garantia: {
    garantiaDias: 15,
    datos: "Tus datos son tuyos: descárgalos cuando quieras, con o sin plan.",
  },

  /** Lo que queda disponible siempre, con o sin plan: se muestra en la portada y en el paywall. */
  siempreGratis: [
    "Guardar el historial de tu mascota",
    "Ver y exportar tus datos cuando quieras",
    "Acceder a tus datos, tengas o no un plan de pago",
  ],

  textos: {
    avisoSimulacion:
      "Simulación local: esta plantilla no cobra, no envía correos ni avisos, y tus datos se guardan solo en este dispositivo.",
    avisoOrientativo: "Orientativo, confirma con tu veterinario.",
    avisoNoVeterinario:
      "Peluvet organiza información. No diagnostica, no receta ni reemplaza a tu veterinario.",
    avisoCalendarioGenerico:
      "Usamos reglas generales y conservadoras. Aún no hay un calendario verificado para tu país, así que no lo tomes como oficial.",
    avisoUrgencia:
      "Si tu mascota está en peligro, no esperes a usar la app: llama a tu veterinario o a una clínica de urgencias.",
    avisoDemo:
      "Estás viendo datos de demostración. Quitarlos no afecta a tus mascotas propias.",
    avisoAlmacenamiento:
      "Tus datos viven solo en este navegador. Si borras los datos del sitio o cambias de dispositivo, se pierden: descarga una copia cuando quieras.",
  },
} as const;

/** Verdadero si el texto tiene una marca por completar, p. ej. "[COMPLETAR: país]". */
export const esMarcador = (texto: string): boolean => /\[[^\]]+\]/.test(texto);

/** Datos que el comprador aún debe completar antes de publicar. Mientras haya alguno, la app avisa. */
export const DATOS_PENDIENTES: string[] = [LEGAL.responsable, LEGAL.contacto, LEGAL.pais, PLANTILLA.urlSitio].filter(
  esMarcador,
);

/** Avisos de plantilla visibles: mientras la app esté en simulación o falten datos por completar. */
export const avisosDePlantilla: boolean = PLANTILLA.modoSimulacion || DATOS_PENDIENTES.length > 0;

export function formatearPrecio(valor: number, moneda: string = PLANTILLA.precios.moneda): string {
  const simbolo = moneda === "USD" ? "US$" : `${moneda} `;
  const texto = Number.isInteger(valor) ? String(valor) : valor.toFixed(2).replace(".", ",");
  return `${simbolo}${texto}`;
}

/** Cuánto se ahorra, en porcentaje entero, al pagar el año completo frente a 12 meses sueltos. */
export function ahorroAnualPorcentaje(precios = PLANTILLA.precios): number {
  const anualPorMeses = precios.mensual * 12;
  return Math.max(0, Math.round((1 - precios.anual / anualPorMeses) * 100));
}

export function limiteDeMascotas(plan: "gratis" | "prueba-simulada"): number {
  return plan === "gratis" ? PLANTILLA.limites.mascotasGratis : PLANTILLA.limites.mascotasPro;
}

/** Texto de garantía que se muestra junto a los botones de plan. */
export function textoGarantia(): string {
  const { garantiaDias, datos } = PLANTILLA.garantia;
  return `Garantía de ${garantiaDias} días. ${datos}`;
}

/** Versión corta, junto al botón de la barra fija en móvil. */
export function textoGarantiaCorta(): string {
  return `Garantía de ${PLANTILLA.garantia.garantiaDias} días · Gratis para empezar`;
}
