import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variante = "primario" | "secundario" | "fantasma" | "peligro";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-control px-6 text-boton font-black transition-[transform,background-color,opacity] duration-[120ms] ease-huellas active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

// Alturas del programa: CTA principal 56 px (ancho completo bajo 480 px), secundario 48 px, terciario al menos 44 px.
const VARIANTES: Record<Variante, string> = {
  // El contorno tenue de tinta da forma visible al botón sobre papel (el naranja solo da 1,95:1).
  primario: "min-h-14 bg-naranja text-tinta shadow-boton ring-1 ring-tinta/25 hover:bg-naranja-hondo max-[479px]:w-full",
  secundario: "min-h-12 bg-hundido text-tinta hover:bg-fondo",
  fantasma: "min-h-11 bg-transparent text-tinta underline-offset-4 hover:underline",
  peligro: "min-h-12 border-2 border-error bg-papel text-error hover:bg-hundido",
};

export function claseBoton(variante: Variante = "primario", extra?: string): string {
  return cn(BASE, VARIANTES[variante], extra);
}

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

export function Boton({ variante = "primario", className, type = "button", ...resto }: BotonProps) {
  return <button type={type} className={claseBoton(variante, className)} {...resto} />;
}

interface BotonLinkProps extends ComponentProps<typeof Link> {
  variante?: Variante;
}

export function BotonLink({ variante = "primario", className, ...resto }: BotonLinkProps) {
  return <Link className={claseBoton(variante, className)} {...resto} />;
}
