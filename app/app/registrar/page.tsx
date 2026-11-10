"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FormularioRegistro } from "@/components/formulario-registro";
import { PantallaCargando } from "@/components/ui/esqueleto";

function Contenido() {
  const params = useSearchParams();
  return <FormularioRegistro tipo={params.get("tipo")} cuidadoId={params.get("cuidado")} />;
}

export default function Registrar() {
  return (
    <Suspense fallback={<PantallaCargando />}>
      <Contenido />
    </Suspense>
  );
}
