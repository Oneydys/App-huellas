import Image from "next/image";
import { cn } from "@/lib/cn";
import { personajePorId, type IdPersonaje } from "@/lib/personajes";
import { PLANTILLA } from "@/lib/plantilla";

export function MascotaAvatar({
  personaje,
  tamano,
  className,
  priority,
  foto,
}: {
  personaje: IdPersonaje;
  /** Si hay foto propia, se muestra en lugar del personaje (recortada en círculo). */
  foto?: string;
  /** Ancho y alto en píxeles. */
  tamano: number;
  className?: string;
  priority?: boolean;
}) {
  const p = personajePorId(personaje);
  if (foto) {
    return (
      <Image
        src={foto}
        alt="Foto de tu mascota"
        width={tamano}
        height={tamano}
        unoptimized
        className={cn("rounded-full object-cover", className)}
        style={{ width: tamano, height: tamano }}
      />
    );
  }
  return (
    <Image
      src={p.imagen}
      alt={p.alt}
      width={tamano}
      height={tamano}
      // Ya viene en el tamaño justo (300 px para 150 px en pantalla): sin optimizador, la URL es estable y se puede precargar.
      unoptimized
      sizes={`${tamano}px`}
      priority={priority}
      // Sin prioridad, la imagen se carga ya: son pequeñas y casi siempre están en la primera pantalla.
      loading={priority ? undefined : "eager"}
      className={cn("object-contain drop-shadow-[0_14px_10px_rgba(154,86,30,0.35)]", className)}
      style={{ width: tamano, height: tamano }}
    />
  );
}

/** Logo de marca (aro, pata y nombre en una sola imagen). El nombre va como texto alternativo. */
export function Logotipo() {
  return (
    <Image
      src="/images/peluvet-logo.png"
      alt={PLANTILLA.nombreApp}
      width={58}
      height={64}
      className="h-16 w-auto"
      priority
    />
  );
}
