"use client";

import { Marco } from "@/components/marco";
import { Boton, BotonLink } from "@/components/ui/boton";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Marco className="items-center justify-center text-center">
      <h1 className="text-titulo font-black">Algo no salió como esperábamos</h1>
      <p className="mt-2 max-w-xs text-cuerpo text-suave-texto">
        Tus datos siguen guardados en este dispositivo. Prueba de nuevo o vuelve al inicio.
      </p>
      <div className="mt-6 flex w-full flex-col gap-3">
        <Boton onClick={reset}>Intentar de nuevo</Boton>
        <BotonLink href="/" variante="secundario">
          Volver al inicio
        </BotonLink>
      </div>
    </Marco>
  );
}
