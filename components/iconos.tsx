import {
  Bug,
  Footprints,
  House,
  NotebookPen,
  PersonStanding,
  Pill,
  Puzzle,
  Scale,
  Stethoscope,
  Syringe,
  Volleyball,
  type LucideIcon,
} from "lucide-react";
import type { TipoActividad, TipoRegistro } from "@/lib/registros";

export const ICONOS_TIPO: Record<TipoRegistro, LucideIcon> = {
  vacuna: Syringe,
  desparasitacion: Bug,
  peso: Scale,
  visita: Stethoscope,
  observacion: NotebookPen,
  medicamento: Pill,
  actividad: Volleyball,
};

/** Un icono por actividad: huellas para paseos, pelota para juegos, movimiento para ejercicio, juguete y casita en casa. */
export const ICONOS_ACTIVIDAD: Record<TipoActividad, LucideIcon> = {
  paseo: Footprints,
  juego: Volleyball,
  ejercicio: PersonStanding,
  "juego-casa": Puzzle,
  "exploracion-casa": House,
  "paseo-arnes": Footprints,
};

export function IconoTipo({ tipo, className }: { tipo: TipoRegistro; className?: string }) {
  const Icono = ICONOS_TIPO[tipo];
  return <Icono aria-hidden className={className} />;
}
