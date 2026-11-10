import { PLANTILLA } from "./plantilla";

/**
 * Tarjeta «Mi huella de la semana». Es genérica a propósito: no lleva nombre, peso, vacunas,
 * fotos ni datos de la familia, así que la misma imagen sirve para cualquier persona.
 */
export const HUELLA_SEMANA = {
  titulo: "Mi huella de la semana",
  /** Texto que la persona puede editar antes de compartir. */
  textoPorDefecto: "Esta semana cuidé a mi mascota con Huellas.",
  pie: PLANTILLA.textos.avisoNoVeterinario,
  archivo: "mi-huella-de-la-semana.png",
  rutaImagen: "/huella-semana/tarjeta",
} as const;
