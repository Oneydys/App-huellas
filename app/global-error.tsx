"use client";

import Link from "next/link";
import "./globals.css";
import { Marco } from "@/components/marco";
import { Boton, claseBoton } from "@/components/ui/boton";
import { nunito } from "@/lib/fuente";

// Reemplaza al layout raíz cuando este falla: por eso trae su propio <html>, <body> y estilos.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es" className={nunito.variable}>
      <body>
        <Marco className="items-center justify-center text-center">
          <h1 className="text-titulo font-black">Algo no salió como esperábamos</h1>
          <p className="mt-2 max-w-xs text-cuerpo text-suave-texto">
            Tus datos siguen guardados en este dispositivo. Prueba de nuevo o vuelve al inicio.
          </p>
          <div className="mt-6 flex w-full flex-col gap-3">
            <Boton onClick={reset}>Intentar de nuevo</Boton>
            <Link href="/" className={claseBoton("secundario")}>
              Volver al inicio
            </Link>
          </div>
        </Marco>
      </body>
    </html>
  );
}
