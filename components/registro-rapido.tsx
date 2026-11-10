"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { OpcionesRegistro } from "@/components/formulario-registro";
import { Hoja } from "@/components/ui/hoja";
import { useHuellas } from "@/lib/store/hooks";

// El formulario solo hace falta al abrir la hoja: se descarga entonces, no en la primera carga.
const FormularioRegistro = dynamic(() => import("@/components/formulario-registro").then((m) => m.FormularioRegistro));

const Contexto = createContext<{ abrir: (opciones?: OpcionesRegistro) => void }>({ abrir: () => {} });

export function useRegistroRapido() {
  return useContext(Contexto);
}

/** Hoja de registro rápido: se abre desde el botón "+" de la navegación y desde los atajos. */
export function ProveedorRegistroRapido({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { mascota } = useHuellas();
  const [estado, setEstado] = useState<{ abierta: boolean; opciones: OpcionesRegistro; clave: number }>({
    abierta: false,
    opciones: {},
    clave: 0,
  });

  const abrir = useCallback(
    (opciones: OpcionesRegistro = {}) => {
      if (!mascota) return router.push("/app/mascotas/nueva");
      setEstado((e) => ({ abierta: true, opciones, clave: e.clave + 1 }));
    },
    [mascota, router],
  );
  const cerrar = useCallback(() => setEstado((e) => ({ ...e, abierta: false })), []);
  const valor = useMemo(() => ({ abrir }), [abrir]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <Hoja abierta={estado.abierta} titulo={`Registrar para ${mascota?.nombre ?? "tu mascota"}`} alCerrar={cerrar}>
        <FormularioRegistro key={estado.clave} {...estado.opciones} enHoja alTerminar={cerrar} />
      </Hoja>
    </Contexto.Provider>
  );
}
