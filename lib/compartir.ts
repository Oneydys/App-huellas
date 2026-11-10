import { estadoDeCategoria, ETIQUETA_ESTADO_CATEGORIA, type PropuestaCuidado } from "./calendario-vivo";
import { formatearFecha, type FechaISO } from "./fechas";
import { codigoMascota, describirEdad, razaOMestizo, type Mascota } from "./mascota";
import { nombreDePais } from "./paises";
import { ETIQUETA_ESPECIE } from "./personajes";
import { PLANTILLA } from "./plantilla";
import { formatearKg, pesoActual, ultimoRegistro, type Registro } from "./registros";

export interface DatosCarnet {
  codigo: string;
  nombre: string;
  linea1: string;
  linea2: string;
  peso: string;
  vacunas: { estado: string; detalle: string };
}

/** Datos ya redactados del carnet: los usan la imagen para compartir y el texto. */
export function datosDelCarnet(
  mascota: Mascota,
  registros: readonly Registro[],
  propuestas: readonly PropuestaCuidado[],
  hoy: FechaISO,
): DatosCarnet {
  const peso = pesoActual(registros, mascota.id);
  const vacuna = ultimoRegistro(registros, mascota.id, "vacuna");
  const estado = estadoDeCategoria("vacuna", registros, propuestas, mascota.id);
  return {
    codigo: codigoMascota(mascota.id),
    nombre: mascota.nombre,
    linea1: `${ETIQUETA_ESPECIE[mascota.especie]} · ${razaOMestizo(mascota)}`,
    linea2: `${describirEdad(mascota, hoy)} · ${nombreDePais(mascota.pais)}`,
    peso: peso ? formatearKg(peso.kg) : "Sin registro",
    vacunas: {
      estado: ETIQUETA_ESTADO_CATEGORIA[estado.estado],
      detalle: vacuna ? `Última: ${vacuna.nombre}, ${formatearFecha(vacuna.fecha)}` : "Aún sin vacunas registradas",
    },
  };
}

/**
 * Lo único que sale del carnet al compartirlo: la mascota y la marca. No lleva peso, vacunas, código,
 * edad ni país: no ayudan a quien recibe el carnet y los dos últimos pueden señalar la ubicación de la familia.
 * El carnet dentro de la app sigue mostrando todo (DatosCarnet).
 */
export interface DatosCompartibles {
  nombre: string;
  /** Especie y raza, o mestizo. */
  linea: string;
}

export function datosParaCompartir(mascota: Mascota): DatosCompartibles {
  return {
    nombre: mascota.nombre,
    linea: `${ETIQUETA_ESPECIE[mascota.especie]} · ${razaOMestizo(mascota)}`,
  };
}

export function textoParaCompartir(d: DatosCompartibles, esDemo = false): string {
  return [
    `Carnet de ${d.nombre}${esDemo ? " (demostración)" : ""}`,
    d.linea,
    `Hecho con ${PLANTILLA.nombreApp}. Es información que anotó su tutor; no reemplaza a un veterinario.`,
  ].join("\n");
}
