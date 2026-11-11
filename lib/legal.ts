/**
 * ═══ TEXTOS LEGALES DE LA PLANTILLA ═══
 * Punto de partida, no asesoría legal. Quien compra la plantilla reemplaza los datos marcados
 * [COMPLETAR] en `LEGAL` y revisa cada texto con su asesor antes de publicarlo con datos reales.
 * Mientras queden marcas, la app muestra avisos y `npm test` falla a propósito (lib/plantilla.test.ts).
 * Describen la app tal como funciona hoy: si conectas servidores, cobros o correo, actualízalos.
 */

export interface SeccionLegal {
  titulo: string;
  parrafos: string[];
  lista?: string[];
}

export interface DocumentoLegal {
  titulo: string;
  resumen: string;
  secciones: SeccionLegal[];
}

const RESPONSABLE = "MILLION BUSINESS DIGITAL";
// Correo de contacto de ejemplo. DEBES cambiarlo por un correo tuyo que vayas a usar con la app
// (también aparece en el aviso de privacidad y en los términos). El gate no bloquea por este dato.
const CONTACTO = "correo@correo.com";
// Dato pendiente: domicilio, país y ley aplicable los completa quien compra la plantilla.
const PAIS = "[COMPLETAR: país]";

export const LEGAL = {
  responsable: RESPONSABLE,
  contacto: CONTACTO,
  pais: PAIS,
  actualizado: "16 de octubre de 2026",
};

export const PRIVACIDAD: DocumentoLegal = {
  titulo: "Política de privacidad",
  resumen: "Tus datos se guardan en este navegador. En esta versión de demostración no se envían a ningún servidor.",
  secciones: [
    {
      titulo: "Quién es responsable",
      parrafos: [`${RESPONSABLE} es responsable de los datos que registras en Peluvet. Para cualquier duda, escribe a ${CONTACTO}.`],
    },
    {
      titulo: "Qué datos se guardan",
      parrafos: ["Lo que escribes o subes en la app:"],
      lista: [
        "Datos de tu mascota: nombre, especie, raza, edad aproximada, país, peso, foto y observaciones de salud.",
        "Registros de cuidados: vacunas, desparasitaciones, visitas, peso, medicamentos y notas.",
        "Nombre y teléfono de contacto que escribes para la tarjeta de mascota perdida.",
        "Tu correo, solo en la pantalla de entrada: no se guarda ni se envía.",
      ],
    },
    {
      titulo: "Dónde se guardan",
      parrafos: [
        "Se guardan en el almacenamiento de tu navegador. Si borras los datos del sitio o cambias de dispositivo, se pierden, salvo que hayas descargado una copia.",
      ],
    },
    {
      titulo: "Para qué los usamos",
      parrafos: [
        "Solo para mostrarte el carnet, el calendario, el resumen para el veterinario y la tarjeta de mascota perdida. Peluvet no los usa para publicidad.",
      ],
    },
    {
      titulo: "Quién puede verlos",
      parrafos: [
        "La app no comparte tus datos con terceros. Si imprimes la tarjeta de mascota perdida o compartes el resumen, lo que incluyas queda a la vista de quien lo reciba.",
      ],
    },
    {
      titulo: "Tus derechos",
      parrafos: [
        "Desde Perfil puedes descargar una copia de tus datos, restaurarla o borrar todo cuando quieras: «Descargar mis datos» y «Borrar todos mis datos».",
      ],
    },
    {
      titulo: "Cambios en esta política",
      parrafos: ["Si cambiamos esta política, actualizaremos la fecha de la parte superior de esta página."],
    },
  ],
};

export const TERMINOS: DocumentoLegal = {
  titulo: "Términos de uso",
  resumen: "Peluvet te ayuda a organizar el historial de tu mascota. No reemplaza a tu veterinario.",
  secciones: [
    {
      titulo: "Qué es Peluvet",
      parrafos: [
        "Peluvet es una herramienta para organizar el carnet, los cuidados y el historial de tu mascota. Puedes usarla sin cuenta. Los planes y la prueba que muestra la app son los que estén activos en cada momento.",
      ],
    },
    {
      titulo: "No es atención veterinaria",
      parrafos: [
        "Peluvet no diagnostica, no receta ni sustituye a tu veterinario. La orientación de urgencia solo señala situaciones para consultar. Ante una emergencia, llama a tu veterinario o a una clínica de urgencias.",
      ],
    },
    {
      titulo: "Calendario y cuidados",
      parrafos: [
        "Los cuidados que muestra la app son orientativos y generales. Confirma las fechas y el esquema de vacunas con tu veterinario. Un calendario por país solo se muestra cuando está verificado con fuentes veterinarias.",
      ],
    },
    {
      titulo: "Tu contenido",
      parrafos: [
        "Eres responsable de la información que registras y de que sea correcta. Puedes editarla o borrarla cuando quieras.",
      ],
    },
    {
      titulo: "Copias de seguridad",
      parrafos: [
        "Tus datos viven en tu navegador. Descarga una copia desde Perfil con regularidad, sobre todo antes de cambiar de dispositivo o de borrar datos del navegador.",
      ],
    },
    {
      titulo: "Cobro, prueba y reembolso",
      parrafos: [
        "Los cobros, las cancelaciones y los reembolsos de Pro los gestiona Hotmart, la plataforma de venta, cuando la compra está activa. En esta demostración no se cobra nada.",
        "Garantía de 15 días: si pides el reembolso dentro de los 15 días desde la compra, la solicitud se gestiona con Hotmart. Peluvet no tiene un proceso de reembolso propio.",
        "Dejar Pro no borra tus datos: siguen en tu navegador y puedes descargarlos desde Perfil.",
      ],
    },
    {
      titulo: "Limitación de responsabilidad",
      parrafos: [
        `En la medida que permita la ley, ${RESPONSABLE} no responde por decisiones tomadas con base en la información de la app ni por la pérdida de datos guardados en tu navegador.`,
      ],
    },
    {
      titulo: "Ley aplicable y contacto",
      parrafos: [`Estos términos se rigen por la legislación de ${PAIS}. Para dudas, escribe a ${CONTACTO}.`],
    },
  ],
};

export const COOKIES: DocumentoLegal = {
  titulo: "Política de cookies",
  resumen: "Peluvet no usa cookies de seguimiento ni publicidad.",
  secciones: [
    {
      titulo: "Qué usamos en su lugar",
      parrafos: [
        "La app guarda en el almacenamiento local de tu navegador lo necesario para funcionar: tus mascotas, tus registros y tus preferencias.",
      ],
    },
    {
      titulo: "Por qué lo necesitamos",
      parrafos: ["Sin ese almacenamiento, la app no puede recordar tu carnet entre visitas."],
    },
    {
      titulo: "Cómo borrarlo",
      parrafos: [
        "Desde Perfil puedes borrar todos tus datos. También puedes borrar los datos del sitio desde la configuración de tu navegador.",
      ],
    },
    {
      titulo: "Si agregas otras herramientas",
      parrafos: [
        "Si añades analítica o publicidad, actualiza esta página y pide tu consentimiento cuando la ley lo exija.",
      ],
    },
  ],
};
