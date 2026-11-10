"use client";

import { useState } from "react";
import { DialogoQuitarDemo } from "@/components/quitar-demo";
import { Chip } from "@/components/ui/chip";
import { PLANTILLA } from "@/lib/plantilla";
import { hayDatosDemo } from "@/lib/store/selectores";
import { useHuellas } from "@/lib/store/hooks";

export function BannerDemo() {
  const { estado } = useHuellas();
  const [abierta, setAbierta] = useState(false);
  if (!hayDatosDemo(estado)) return null;
  return (
    <>
      <div data-captura="oculto" className="no-imprimir mb-4 flex w-full flex-col items-start gap-2 rounded-control bg-hundido p-3">
        <Chip tono="naranja">DEMO</Chip>
        <p className="w-full text-cuerpo text-suave-texto">{PLANTILLA.textos.avisoDemo}</p>
        <button
          type="button"
          onClick={() => setAbierta(true)}
          className="-ml-2 min-h-11 rounded-chip px-2 text-cuerpo font-black underline underline-offset-4"
        >
          Quitar datos
        </button>
      </div>
      <DialogoQuitarDemo abierta={abierta} alCerrar={() => setAbierta(false)} />
    </>
  );
}
