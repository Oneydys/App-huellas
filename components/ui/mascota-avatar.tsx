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

export function Logotipo() {
  return (
    <span className="flex items-center gap-2 text-cuerpo font-black">
      <span aria-hidden className="grid size-8 place-items-center rounded-chip bg-naranja text-tinta">
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
          <path d="M12 21c-1.6-1.4-6-4.3-6-8a3.6 3.6 0 0 1 6-2.6A3.6 3.6 0 0 1 18 13c0 3.7-4.4 6.6-6 8Z" />
        </svg>
      </span>
      {PLANTILLA.nombreApp}
    </span>
  );
}
