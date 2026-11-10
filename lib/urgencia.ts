import type { Especie } from "./personajes";

/**
 * Orientación de urgencia CONSERVADORA. No diagnostica ni sugiere tratamientos: solo
 * clasifica señales conocidas y deriva siempre a un profesional. Nunca devuelve un
 * mensaje que descarte un problema ("no es nada", "está bien").
 */
export type NivelUrgencia = "ahora" | "hoy" | "sin-senales";

export interface Senal {
  id: string;
  texto: string;
  nivel: Exclude<NivelUrgencia, "sin-senales">;
}

export const SENALES: readonly Senal[] = [
  { id: "respiracion", texto: "Le cuesta respirar, respira con la boca abierta o con mucho esfuerzo", nivel: "ahora" },
  { id: "colapso", texto: "Se desmayó, convulsiona, no responde o no puede levantarse", nivel: "ahora" },
  { id: "sangrado", texto: "Sangrado que no se detiene o una herida profunda", nivel: "ahora" },
  { id: "golpe", texto: "Recibió un golpe fuerte, un atropello o cayó desde altura", nivel: "ahora" },
  { id: "toxico", texto: "Pudo haber comido o lamido algo tóxico (veneno, chocolate, plantas o medicamentos humanos)", nivel: "ahora" },
  { id: "orina", texto: "Intenta orinar y no puede, o se queja al hacerlo", nivel: "ahora" },
  { id: "abdomen", texto: "Tiene el abdomen hinchado y duro, o hace arcadas sin lograr vomitar", nivel: "ahora" },
  { id: "encias", texto: "Tiene las encías muy pálidas, blancas, azuladas o amarillas", nivel: "ahora" },
  { id: "calor", texto: "Jadea mucho tras calor o ejercicio y está decaído o desorientado", nivel: "ahora" },
  { id: "vomito", texto: "Vomitó varias veces en un día", nivel: "hoy" },
  { id: "diarrea", texto: "Tiene diarrea por más de un día, o con sangre", nivel: "hoy" },
  { id: "apetito", texto: "No come o no bebe desde hace más de un día", nivel: "hoy" },
  { id: "decaimiento", texto: "Está más apagado o decaído de lo habitual", nivel: "hoy" },
  { id: "cojera", texto: "Cojea o no apoya una pata", nivel: "hoy" },
  { id: "ojo", texto: "Tiene un ojo cerrado, muy rojo o con secreción", nivel: "hoy" },
];

export interface OrientacionUrgencia {
  nivel: NivelUrgencia;
  titulo: string;
  mensaje: string;
  senales: Senal[];
}

export function evaluarUrgencia(
  idsMarcados: readonly string[],
  contexto: { especie: Especie; esCria: boolean },
): OrientacionUrgencia {
  const marcadas = SENALES.filter((s) => idsMarcados.includes(s.id));
  // En crías (menos de 4 meses) cualquier señal se trata con prioridad máxima.
  const hayAhora = marcadas.some((s) => s.nivel === "ahora") || (contexto.esCria && marcadas.length > 0);
  if (hayAhora) {
    return {
      nivel: "ahora",
      titulo: "Busca atención veterinaria ahora",
      mensaje:
        "Llama a tu veterinario o a una clínica de urgencias y ve cuanto antes. No le des medicamentos ni intentes tratarlo por tu cuenta si un profesional no te lo indica.",
      senales: marcadas,
    };
  }
  if (marcadas.length > 0) {
    return {
      nivel: "hoy",
      titulo: "Llama hoy a tu veterinario",
      mensaje:
        "Cuéntale lo que ves para que decida si necesita revisión. Si empeora o aparece algo más de la lista, busca atención de inmediato.",
      senales: marcadas,
    };
  }
  return {
    nivel: "sin-senales",
    titulo: "No marcaste ninguna señal",
    mensaje:
      "Esta lista no descarta ningún problema. Si algo te preocupa, llama a tu veterinario: conoces a tu mascota mejor que cualquier lista.",
    senales: [],
  };
}
