import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tono = "neutro" | "naranja" | "exito" | "aviso" | "error";

// Los chips llevan su propio fondo papel con borde sutil: el contraste del texto no
// depende de la tarjeta donde se coloquen.
const TONOS: Record<Tono, string> = {
  neutro: "bg-papel text-suave-texto ring-1 ring-linea",
  naranja: "bg-naranja text-tinta",
  exito: "bg-papel text-exito ring-1 ring-linea",
  aviso: "bg-papel text-aviso ring-1 ring-aviso/40",
  error: "bg-papel text-error ring-1 ring-error/40",
};

export function Chip({
  tono = "neutro",
  className,
  children,
  ...resto
}: {
  tono?: Tono;
  className?: string;
  children: React.ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children">) {
  return (
    <span
      {...resto}
      className={cn(
        "inline-flex items-center gap-1 rounded-chip px-3 py-1 text-etiqueta font-extrabold",
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}
