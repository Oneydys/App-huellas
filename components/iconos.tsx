import { Bug, NotebookPen, Pill, Scale, Stethoscope, Syringe, type LucideIcon } from "lucide-react";
import type { TipoRegistro } from "@/lib/registros";

export const ICONOS_TIPO: Record<TipoRegistro, LucideIcon> = {
  vacuna: Syringe,
  desparasitacion: Bug,
  peso: Scale,
  visita: Stethoscope,
  observacion: NotebookPen,
  medicamento: Pill,
};

export function IconoTipo({ tipo, className }: { tipo: TipoRegistro; className?: string }) {
  const Icono = ICONOS_TIPO[tipo];
  return <Icono aria-hidden className={className} />;
}
