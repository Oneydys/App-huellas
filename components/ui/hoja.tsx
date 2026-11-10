"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

interface HojaProps {
  abierta: boolean;
  titulo: string;
  alCerrar: () => void;
  children: React.ReactNode;
  /** Enfoca «Cerrar» al abrir en vez del primer campo (útil cuando un campo abriría el teclado del móvil). */
  enfocarCerrar?: boolean;
}

const FOCALIZABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Hoja inferior accesible: cierra con Escape o tocando fuera, atrapa el foco y bloquea el scroll. */
export function Hoja({ abierta, titulo, alCerrar, children, enfocarCerrar = false }: HojaProps) {
  const idTitulo = useId();
  const panel = useRef<HTMLDivElement>(null);
  const previo = useRef<Element | null>(null);

  useEffect(() => {
    if (!abierta) return;
    previo.current = document.activeElement;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      // Primero el campo marcado con data-autofocus (teclado listo), si no el primer control.
      const destino =
        (enfocarCerrar ? panel.current?.querySelector<HTMLElement>('button[aria-label="Cerrar"]') : null) ??
        panel.current?.querySelector<HTMLElement>("[data-autofocus]") ??
        panel.current?.querySelectorAll<HTMLElement>(FOCALIZABLES)[1] ??
        panel.current?.querySelector<HTMLElement>(FOCALIZABLES);
      destino?.focus();
    }, 50);

    function alTeclear(e: KeyboardEvent) {
      if (e.key === "Escape") {
        alCerrar();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCALIZABLES)];
      if (items.length === 0) return;
      const primero = items[0];
      const ultimo = items[items.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }
    document.addEventListener("keydown", alTeclear);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflowPrevio;
      if (previo.current instanceof HTMLElement) previo.current.focus();
    };
  }, [abierta, alCerrar, enfocarCerrar]);

  return (
    <>
      {abierta && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="fondo-hoja absolute inset-0 bg-tinta/40" onClick={alCerrar} aria-hidden />
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitulo}
            className="hoja-entrada relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-tarjeta bg-papel p-6 shadow-calida"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id={idTitulo} className="text-titulo font-black">
                {titulo}
              </h2>
              <button
                type="button"
                onClick={alCerrar}
                aria-label="Cerrar"
                className="grid size-11 shrink-0 place-items-center rounded-control bg-hundido text-tinta"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
