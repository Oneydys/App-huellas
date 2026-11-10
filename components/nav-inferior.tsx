"use client";

import { CalendarDays, House, IdCard, Plus, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRegistroRapido } from "@/components/registro-rapido";
import { cn } from "@/lib/cn";

const ITEMS: { href: string; etiqueta: string; icono: LucideIcon; activoEn: string[] }[] = [
  { href: "/app", etiqueta: "Inicio", icono: House, activoEn: ["/app", "/app/urgencia"] },
  { href: "/app/calendario", etiqueta: "Agenda", icono: CalendarDays, activoEn: ["/app/calendario"] },
  { href: "/app/registrar", etiqueta: "Registrar", icono: Plus, activoEn: ["/app/registrar"] },
  { href: "/app/carnet", etiqueta: "Carnet", icono: IdCard, activoEn: ["/app/carnet", "/app/resumen"] },
  { href: "/app/perfil", etiqueta: "Perfil", icono: UserRound, activoEn: ["/app/perfil", "/app/mascotas"] },
];

function coincide(ruta: string, activoEn: string[]): boolean {
  return activoEn.some((a) => (a === "/app" ? ruta === a : ruta === a || ruta.startsWith(`${a}/`)));
}

export function NavInferior() {
  const ruta = usePathname();
  const { abrir } = useRegistroRapido();
  return (
    <nav
      aria-label="Principal"
      className="no-imprimir fixed inset-x-0 bottom-0 z-40 mx-auto grid w-full max-w-md grid-cols-5 rounded-t-tarjeta border-t border-linea bg-papel/95 px-1 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur"
    >
      {ITEMS.map(({ href, etiqueta, icono: Icono, activoEn }) => {
        const activo = coincide(ruta, activoEn);
        if (href === "/app/registrar") {
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
                activo ? "bg-naranja text-tinta" : "bg-transparent",
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
