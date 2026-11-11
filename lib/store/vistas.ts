"use client";

import { useMemo } from "react";
import { calcularCalendario, cuidadoDestacado, type ResultadoCalendario } from "../calendario-vivo";
import { registrosDe, type Registro } from "../registros";
import { useHuellas, type Peluvet } from "./hooks";

export interface VistaMascota extends Peluvet {
  registros: Registro[];
  calendario: ResultadoCalendario | null;
  destacado: ReturnType<typeof cuidadoDestacado>;
}

/** Datos derivados de la mascota activa: sus registros y su Calendario Vivo. */
export function useVistaMascota(): VistaMascota {
  const h = useHuellas();
  const { mascota, estado, hoy, listo } = h;
  const registros = useMemo(() => (mascota ? registrosDe(estado.registros, mascota.id) : []), [mascota, estado.registros]);
  const calendario = useMemo(
    () => (listo && mascota ? calcularCalendario({ mascota, registros: estado.registros, cuidados: estado.cuidados, hoy }) : null),
    [listo, mascota, estado.registros, estado.cuidados, hoy],
  );
  const destacado = useMemo(
    () => (calendario && mascota ? cuidadoDestacado(calendario.propuestas, mascota.prioridad) : undefined),
    [calendario, mascota],
  );
  return { ...h, registros, calendario, destacado };
}
