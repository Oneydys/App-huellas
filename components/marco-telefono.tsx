import Image from "next/image";
import { cn } from "@/lib/cn";

/** Captura real de la app (con datos de demostración) dentro de un marco de teléfono. */
export function MarcoTelefono({
  src,
  alt,
  className,
  prioridad = false,
  ancho = 220,
}: {
  src: string;
  alt: string;
  className?: string;
  prioridad?: boolean;
  ancho?: number;
}) {
  return (
    <div
      className={cn("shrink-0 overflow-hidden rounded-tarjeta bg-papel shadow-calida", className)}
      style={{ width: ancho }}
    >
      <Image
        src={src}
        alt={alt}
        width={750}
        height={1624}
        sizes={`${ancho}px`}
        priority={prioridad}
        loading={prioridad ? undefined : "lazy"}
        className="h-auto w-full"
      />
    </div>
  );
}
