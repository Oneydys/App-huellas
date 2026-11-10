import { z } from "zod";
import { esFechaISO, mesesCumplidos, sumarMeses, type FechaISO } from "./fechas";
import { CODIGOS_PAIS } from "./paises";
import { IDS_PERSONAJE, personajePorId } from "./personajes";

export const ORIGENES = ["usuario", "demo"] as const;
export type Origen = (typeof ORIGENES)[number];

/** Cuidado que la persona quiere ver primero (no cambia las reglas, solo el orden de inicio). */
export const PRIORIDADES = ["vacuna", "desparasitacion", "peso", "visita"] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

export const ETIQUETA_PRIORIDAD: Record<Prioridad, string> = {
  vacuna: "Vacunas y refuerzos",
  desparasitacion: "Desparasitación",
  peso: "Peso y cambios",
  visita: "Revisión veterinaria",
};

export const fechaISOSchema = z
  .string({ error: "Escribe una fecha válida." })
  .refine(esFechaISO, { error: "Escribe una fecha válida." });

/** Foto ya reducida en el navegador (JPEG/WebP en base64): se guarda junto al resto de datos. */
export const fotoSchema = z
  .string()
  .max(200_000, { error: "La foto es demasiado grande." })
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/, { error: "La foto no es válida." });

/** Contacto que aparece en la tarjeta de mascota perdida. Es un dato opcional de la propia persona. */
export const contactoSchema = z.object({
  nombre: z.string().trim().max(60, { error: "El nombre admite hasta 60 caracteres." }),
  telefono: z.string().trim().max(30, { error: "El teléfono admite hasta 30 caracteres." }),
  nota: z.string().trim().max(140, { error: "La nota admite hasta 140 caracteres." }),
});
export type Contacto = z.infer<typeof contactoSchema>;

export const mascotaSchema = z
  .object({
    id: z.string().min(1),
    nombre: z
      .string({ error: "Escribe su nombre." })
      .trim()
      .min(1, { error: "Escribe su nombre." })
      .max(24, { error: "El nombre admite hasta 24 caracteres." }),
    especie: z.enum(["perro", "gato"], { error: "Elige si es perro o gato." }),
    personaje: z.enum(IDS_PERSONAJE, { error: "Elige un personaje." }),
    nacimiento: fechaISOSchema,
    nacimientoAproximado: z.boolean({ error: "Indica si la fecha es aproximada." }),
    raza: z.string({ error: "Revisa la raza." }).trim().max(40, { error: "La raza admite hasta 40 caracteres." }),
    pais: z.enum(CODIGOS_PAIS, { error: "Elige el país donde vive." }),
    prioridad: z.enum(PRIORIDADES, { error: "Elige un cuidado prioritario." }),
    creadaEn: fechaISOSchema,
    origen: z.enum(ORIGENES),
    foto: fotoSchema.optional(),
    contacto: contactoSchema.optional(),
  })
  .refine((m) => personajePorId(m.personaje).especie === m.especie, {
    error: "El personaje no coincide con la especie.",
    path: ["personaje"],
  });

export type Mascota = z.infer<typeof mascotaSchema>;

export type DatosMascota = Omit<Mascota, "id" | "creadaEn" | "origen"> & { origen?: Origen };

export type ResultadoMascota =
  | { ok: true; mascota: Mascota }
  | { ok: false; errores: Record<string, string> };

export function crearMascota(
  datos: DatosMascota,
  contexto: { id: string; hoy: FechaISO },
): ResultadoMascota {
  const r = mascotaSchema.safeParse({
    ...datos,
    id: contexto.id,
    creadaEn: contexto.hoy,
    origen: datos.origen ?? "usuario",
  });
  if (r.success) {
    if (r.data.nacimiento > contexto.hoy) {
      return { ok: false, errores: { nacimiento: "La fecha de nacimiento no puede ser futura." } };
    }
    return { ok: true, mascota: r.data };
  }
  const errores: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const campo = String(issue.path[0] ?? "general");
    errores[campo] ??= issue.message;
  }
  return { ok: false, errores };
}

/** Fecha de nacimiento aproximada a partir de una edad en años y meses. */
export function nacimientoDesdeEdad(anios: number, meses: number, hoy: FechaISO): FechaISO {
  return sumarMeses(hoy, -(anios * 12 + meses));
}

export function edadEnMeses(mascota: Pick<Mascota, "nacimiento">, hoy: FechaISO): number {
  return mesesCumplidos(mascota.nacimiento, hoy);
}

export type EtapaVida = "cria" | "juvenil" | "adulto" | "mayor";

export const ETIQUETA_ETAPA: Record<EtapaVida, string> = {
  cria: "Cría",
  juvenil: "Juvenil",
  adulto: "Adulto",
  mayor: "Mayor",
};

/** Etapas genéricas y conservadoras; el tamaño o la raza pueden cambiarlas. */
export function etapaDeVida(mascota: Pick<Mascota, "nacimiento">, hoy: FechaISO): EtapaVida {
  const meses = edadEnMeses(mascota, hoy);
  // [VERIFICAR: fuente] Umbrales de edad en meses (4, 12 y 84) sin fuente veterinaria citada.
  if (meses < 4) return "cria";
  if (meses < 12) return "juvenil";
  if (meses < 84) return "adulto";
  return "mayor";
}

export function describirEdad(mascota: Pick<Mascota, "nacimiento">, hoy: FechaISO): string {
  const total = edadEnMeses(mascota, hoy);
  if (total < 1) return "Menos de 1 mes";
  const anios = Math.floor(total / 12);
  const meses = total % 12;
  const a = anios === 1 ? "1 año" : `${anios} años`;
  const m = meses === 1 ? "1 mes" : `${meses} meses`;
  if (anios === 0) return m;
  if (anios >= 3 || meses === 0) return a;
  return `${a} y ${m}`;
}

export function razaOMestizo(mascota: Pick<Mascota, "raza" | "especie">): string {
  return mascota.raza.trim() || (mascota.especie === "gato" ? "Gato mestizo" : "Perro mestizo");
}

/**
 * Código estable del carnet (por ejemplo "HU-0A3K9Z2X1QB"), el que identifica la tarjeta de mascota
 * perdida. No contiene datos personales. Resume un hash de 53 bits del id: como el id lleva un UUID
 * completo, el código no se puede adivinar ni enumerar con facilidad.
 */
export function codigoMascota(id: string): string {
  return `HU-${hashDeCadena(id).toString(36).toUpperCase().padStart(11, "0")}`;
}

/** Hash de 53 bits (cyrb53, de dominio público): dos mezclas de 32 bits con semillas distintas. */
function hashDeCadena(texto: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < texto.length; i++) {
    const c = texto.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
