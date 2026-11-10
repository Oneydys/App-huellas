import Image from "next/image";
import { cn } from "@/lib/cn";

// Trazo SVG del QR decorativo: el código real de la mascota de demostración (qrcode, nivel M). Sin texto ni enlace.
const QR_TRAZO = "M0 0h7v1h-7zM10 0h1v1h-1zM14 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM9 1h1v1h-1zM11 1h2v1h-2zM14 1h1v1h-1zM20 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM8 2h1v1h-1zM11 2h2v1h-2zM14 2h1v1h-1zM16 2h3v1h-3zM20 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM8 3h4v1h-4zM14 3h1v1h-1zM16 3h3v1h-3zM20 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM8 4h5v1h-5zM14 4h1v1h-1zM16 4h3v1h-3zM20 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM8 5h1v1h-1zM12 5h1v1h-1zM14 5h1v1h-1zM20 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h7v1h-7zM8 7h1v1h-1zM10 7h3v1h-3zM0 8h1v1h-1zM2 8h5v1h-5zM12 8h1v1h-1zM14 8h5v1h-5zM1 9h2v1h-2zM4 9h2v1h-2zM7 9h4v1h-4zM12 9h1v1h-1zM14 9h2v1h-2zM17 9h1v1h-1zM19 9h2v1h-2zM2 10h2v1h-2zM5 10h3v1h-3zM9 10h3v1h-3zM13 10h3v1h-3zM20 10h1v1h-1zM0 11h1v1h-1zM2 11h1v1h-1zM4 11h1v1h-1zM7 11h3v1h-3zM13 11h1v1h-1zM16 11h4v1h-4zM0 12h1v1h-1zM2 12h3v1h-3zM6 12h1v1h-1zM9 12h3v1h-3zM16 12h1v1h-1zM8 13h5v1h-5zM15 13h3v1h-3zM19 13h2v1h-2zM0 14h7v1h-7zM10 14h1v1h-1zM12 14h1v1h-1zM17 14h2v1h-2zM0 15h1v1h-1zM6 15h1v1h-1zM8 15h2v1h-2zM11 15h4v1h-4zM18 15h3v1h-3zM0 16h1v1h-1zM2 16h3v1h-3zM6 16h1v1h-1zM8 16h1v1h-1zM10 16h1v1h-1zM12 16h1v1h-1zM14 16h2v1h-2zM17 16h1v1h-1zM19 16h1v1h-1zM0 17h1v1h-1zM2 17h3v1h-3zM6 17h1v1h-1zM8 17h1v1h-1zM12 17h1v1h-1zM18 17h1v1h-1zM0 18h1v1h-1zM2 18h3v1h-3zM6 18h1v1h-1zM8 18h1v1h-1zM10 18h2v1h-2zM17 18h1v1h-1zM0 19h1v1h-1zM6 19h1v1h-1zM15 19h1v1h-1zM20 19h1v1h-1zM0 20h7v1h-7zM8 20h1v1h-1zM10 20h2v1h-2zM15 20h2v1h-2z";

/** Huella de cuatro dedos y almohadilla: las mismas formas que la tarjeta de la mascota. */
function Huella({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 120" className={cn("pointer-events-none absolute fill-papel/25", className)}>
      <ellipse cx="60" cy="78" rx="22" ry="18" />
      <ellipse cx="32" cy="52" rx="9" ry="12" />
      <ellipse cx="52" cy="38" rx="9" ry="12" />
      <ellipse cx="74" cy="38" rx="9" ry="12" />
      <ellipse cx="94" cy="52" rx="9" ry="12" />
    </svg>
  );
}

/**
 * Carnet de la portada: la pantalla principal real de la app (captura de producción con datos de demostración)
 * dentro de un dispositivo inclinado como un carnet. Firma: huellas de marca de agua sobre el carnet naranja y
 * un QR pequeño en la esquina. La base de la captura se funde con el papel de la sección.
 */
export function HeroeCarnet({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-88 md:max-w-none", className)}>
      <div className="relative overflow-hidden rounded-tarjeta bg-gradient-to-br from-naranja-claro to-naranja-hondo pt-14">
        <Huella className="-left-2 top-[18%] size-16 -rotate-12" />
        <Huella className="-right-3 top-[46%] size-14 rotate-12" />
        <Huella className="left-[6%] top-[68%] size-12 -rotate-6" />

        <div aria-hidden className="absolute right-3 top-3 z-20 rotate-6 rounded-chip bg-papel p-2 shadow-calida">
          <svg viewBox="-2 -2 25 25" className="size-14 text-tinta" shapeRendering="crispEdges">
            <path fill="currentColor" d={QR_TRAZO} />
          </svg>
        </div>

        {/* La máscara funde la base del dispositivo; el flotado es lento y solo mueve el marco, no la captura. */}
        <div className="heroe-mascara relative z-10 mx-auto w-[min(64%,14rem)] -rotate-[4deg] md:w-[min(74%,17rem)]">
          <div className="flotar-lento rounded-[2.2rem] bg-tinta p-1.5 shadow-marco">
            <Image
              src="/images/capturas/heroe-huellas.webp"
              alt="Pantalla principal de la app Huellas"
              width={780}
              height={2130}
              priority
              fetchPriority="high"
              sizes="(max-width: 767px) 224px, 272px"
              className="block h-auto w-full rounded-[1.8rem]"
            />
          </div>
        </div>

        {/* Velo del color de fondo de la sección (papel) en la base: no hay corte brusco. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/3 bg-gradient-to-t from-papel to-transparent" />
      </div>
    </div>
  );
}
