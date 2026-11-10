import { z } from "zod";
import { razaOMestizo, type Mascota } from "./mascota";
import { IDS_PERSONAJE } from "./personajes";
import { esMarcador, PLANTILLA } from "./plantilla";

/** Colores del QR: tinta sobre papel. Son los tokens de app/globals.css (lo comprueba lib/qr.test.ts). */
export const COLORES_QR = { oscuro: "#241d45", claro: "#fffdfb" } as const;

/**
 * Lo único que viaja en el código QR: lo que identifica a la mascota.
 * Nunca el teléfono, el nombre de quien la cuida, la nota ni la fecha de nacimiento.
 */
export const datosIdentificacionSchema = z.object({
  nombre: z.string().trim().min(1).max(24),
  personaje: z.enum(IDS_PERSONAJE),
  raza: z.string().trim().min(1).max(40),
});

export type DatosIdentificacion = z.infer<typeof datosIdentificacionSchema>;

export function datosDeIdentificacion(mascota: Pick<Mascota, "nombre" | "personaje" | "especie" | "raza">): DatosIdentificacion {
  return { nombre: mascota.nombre, personaje: mascota.personaje, raza: razaOMestizo(mascota) };
}

/**
 * Dirección base de los enlaces del QR. Si el comprador ya escribió la dirección pública del sitio
 * (`urlSitio` en lib/plantilla.ts), el QR apunta a ella para que se lea desde cualquier teléfono.
 * Mientras siga como [COMPLETAR], el QR apunta al origen actual (sirve en el mismo equipo o red).
 */
export function baseDeEnlaces(origenActual: string): string {
  const publica = PLANTILLA.urlSitio;
  const base = !esMarcador(publica) && /^https:\/\//.test(publica) ? publica : origenActual;
  return base.replace(/\/+$/, "");
}

/**
 * Enlace del QR: /encontrada/<código>#nombre=…&personaje=…&raza=…
 * Los datos van en el fragmento (#), que el navegador no envía al servidor: ni el hosting ni los
 * registros de acceso ven el nombre de la mascota.
 */
export function urlEncontrada(base: string, codigo: string, datos: DatosIdentificacion): string {
  const params = new URLSearchParams({ nombre: datos.nombre, personaje: datos.personaje, raza: datos.raza });
  return `${base}/encontrada/${encodeURIComponent(codigo)}#${params.toString()}`;
}

/** Lee el fragmento de un enlace del QR. Devuelve null si falta algo o no es válido. */
export function leerDatosEncontrada(fragmento: string): DatosIdentificacion | null {
  const params = new URLSearchParams(fragmento.replace(/^#/, ""));
  const r = datosIdentificacionSchema.safeParse({
    nombre: params.get("nombre") ?? "",
    personaje: params.get("personaje") ?? "",
    raza: params.get("raza") ?? "",
  });
  return r.success ? r.data : null;
}
