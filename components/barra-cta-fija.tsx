"use client";

import { useEffect, useState } from "react";
import { BotonLink } from "@/components/ui/boton";
import { cn } from "@/lib/cn";
import { textoGarantiaCorta } from "@/lib/plantilla";
import { useHuellas } from "@/lib/store/hooks";

/**
 * Botón principal siempre a la vista en móvil: aparece cuando el botón del héroe sale de la
 * pantalla y se queda fijo abajo, con la garantía justo al lado.
 */
export function BarraCtaFija({ observar }: { observar: string }) {
  const { listo, mascota, estado } = useHuellas();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById(observar);
    if (!el) return;
    const o = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting && e.boundingClientRect.top < 0), {
      threshold: 0,
    });
    o.observe(el);
    return () => o.disconnect();
  }, [observar]);

  const tiene = listo && mascota;
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md rounded-t-tarjeta border-t border-linea bg-papel/95 px-6 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-calida backdrop-blur transition-[transform,visibility] duration-300 ease-huellas",
        visible ? "translate-y-0 visible" : "invisible translate-y-full",
      )}
    >
      <BotonLink
        id="cta-inicio-fija"
        data-evento="inicio-compra"
        href={tiene ? (estado.accesoSimulado ? "/app" : "/paywall") : "/onboarding"}
        tabIndex={visible ? 0 : -1}
        className="min-h-16! w-full"
      >
        {tiene ? `Continuar con ${mascota.nombre}` : "Crear el carnet de mi mascota"}
      </BotonLink>
      <p className="mt-2 text-center text-cuerpo text-suave-texto">{textoGarantiaCorta()}</p>
    </div>
  );
}
