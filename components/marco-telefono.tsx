import Image from "next/image";
import { cn } from "@/lib/cn";

/** Captura real de la app (con datos de demostración) dentro de un marco de teléfono. */
export function MarcoTelefono({
  src,
  alt,
  className,
  prioridad = false,
  ancho = 220,
  fluido = false,
}: {
  src: string;
  alt: string;
  className?: string;
  prioridad?: boolean;
  ancho?: number;
  /** Ocupa el ancho de su columna (sin ancho fijo), para móviles pequeños. */
  fluido?: boolean;
}) {
  return (
    <div
      className={cn("overflow-hidden rounded-tarjeta bg-papel shadow-calida", fluido ? "w-full" : "shrink-0", className)}
      style={fluido ? undefined : { width: ancho }}
    >
      <Image
        src={src}
        alt={alt}
        width={750}
        height={1624}
        sizes={fluido ? "(max-width: 480px) 45vw, 200px" : `${ancho}px`}
        priority={prioridad}
        loading={prioridad ? undefined : "lazy"}
        className="h-auto w-full"
      />
    </div>
  );
}
