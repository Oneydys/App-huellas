import Link from "next/link";
import { cn } from "@/lib/cn";

const ENLACES = [
  { href: "/legal/privacidad", texto: "Privacidad" },
  { href: "/legal/terminos", texto: "Términos" },
  { href: "/legal/cookies", texto: "Cookies" },
];

/** Enlaces legales al pie de las pantallas de entrada, acceso y planes. */
export function NavLegal({ prefijo, className }: { prefijo?: string; className?: string }) {
  return (
    <nav
      aria-label="Legal"
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-cuerpo font-bold text-suave-texto",
        className,
      )}
    >
      {prefijo && <span>{prefijo}</span>}
      {/* El separador va detrás de cada enlace, para que al saltar de línea nunca empiece una línea con «·». */}
      {ENLACES.map((e, i) => (
        <span key={e.href} className="inline-flex items-center">
          <Link href={e.href} className="inline-flex min-h-11 min-w-11 items-center justify-center underline-offset-4 hover:underline">
            {e.texto}
          </Link>
          {i < ENLACES.length - 1 && (
            <span aria-hidden className="ml-2">
              ·
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
