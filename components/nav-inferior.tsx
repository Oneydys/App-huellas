"use client";

import { CalendarDays, House, IdCard, Plus, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRegistroRapido } from "@/components/registro-rapido";
import { cn } from "@/lib/cn";
import { useBaseDelPanel } from "@/lib/rutas";

// Rutas relativas al panel: la base (/app o /demo) se añade según dónde esté el usuario.
const ITEMS: { ruta: string; etiqueta: string; icono: LucideIcon; activoEn: string[] }[] = [
  { ruta: "", etiqueta: "Inicio", icono: House, activoEn: ["", "/urgencia"] },
  { ruta: "/calendario", etiqueta: "Agenda", icono: CalendarDays, activoEn: ["/calendario"] },
  { ruta: "/registrar", etiqueta: "Registrar", icono: Plus, activoEn: ["/registrar"] },
  { ruta: "/carnet", etiqueta: "Carnet", icono: IdCard, activoEn: ["/carnet", "/resumen"] },
  { ruta: "/perfil", etiqueta: "Perfil", icono: UserRound, activoEn: ["/perfil", "/mascotas"] },
];

/** true si la ruta actual (ya sin la base) cae en alguno de los tramos activos. */
function coincide(sinBase: string, activoEn: string[]): boolean {
  return activoEn.some((a) => (a === "" ? sinBase === "" : sinBase === a || sinBase.startsWith(`${a}/`)));
}

/** Quita la base (/app o /demo) de la ruta actual para comparar tramos. */
function sinBase(ruta: string, base: string): string {
  if (ruta === base) return "";
  return ruta.startsWith(`${base}/`) ? ruta.slice(base.length) : "\u0000";
}

export function NavInferior() {
  const ruta = usePathname();
  const base = useBaseDelPanel();
  const { abrir } = useRegistroRapido();
  const actual = sinBase(ruta, base);
  return (
    <nav
      aria-label="Principal"
      className="no-imprimir fixed inset-x-0 bottom-0 z-40 mx-auto grid w-full max-w-md grid-cols-5 rounded-t-tarjeta border-t border-linea bg-papel/95 px-1 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur"
    >
      {ITEMS.map(({ ruta: tramo, etiqueta, icono: Icono, activoEn }) => {
        const href = `${base}${tramo}`;
        const activo = coincide(actual, activoEn);
        if (tramo === "/registrar") {
          // El "+" abre la hoja rápida sin salir de la pantalla en que estás.
          return (
            <button
              key={href}
              type="button"
              aria-haspopup="dialog"
              onClick={() => abrir()}
              className="flex min-h-14 w-full min-w-0 flex-col items-center justify-center gap-1 rounded-control text-etiqueta font-extrabold text-tinta transition-transform duration-[120ms] active:scale-95"
            >
              <span className="grid h-8 w-12 place-items-center rounded-chip bg-naranja text-tinta shadow-boton">
                <Icono aria-hidden className="size-5" />
              </span>
              {etiqueta}
            </button>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className="flex min-h-14 w-full min-w-0 flex-col items-center justify-center gap-1 rounded-control text-etiqueta font-extrabold text-tinta/80 transition-transform duration-[120ms] active:scale-95 aria-[current=page]:text-tinta"
          >
            <span
              className={cn(
                "grid h-8 w-12 place-items-center rounded-chip transition-colors duration-200",
                activo ? "bg-turquesa text-tinta" : "bg-transparent",
              )}
            >
              <Icono aria-hidden className="size-5" />
            </span>
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
