import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Marco decorativo de Peluvet para la foto de cualquier mascota (perro o gato).
 * La foto va entera (object-contain): no se recorta cabeza, patas ni cuerpo.
 * La ventana de la foto está calculada sobre el diseño original del marco (1086 × 1448).
 */
export const MARCO_VENTANA = { izquierda: 12, arriba: 9, ancho: 76, alto: 83 } as const;

export function MarcoFoto({
  src,
  alt,
  className,
  priority,
  sizes = "(max-width: 440px) 70vw, 300px",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={cn("relative mx-auto aspect-[1086/1448] w-full", className)}>
      <div
        className="absolute overflow-hidden rounded-[12px] bg-papel"
        style={{
          left: `${MARCO_VENTANA.izquierda}%`,
          top: `${MARCO_VENTANA.arriba}%`,
          width: `${MARCO_VENTANA.ancho}%`,
          height: `${MARCO_VENTANA.alto}%`,
        }}
      >
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-contain" />
      </div>
      <Image
        src="/images/marco/marco-peluvet.webp"
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        className="pointer-events-none object-contain"
      />
    </div>
  );
}
