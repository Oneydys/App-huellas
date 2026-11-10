"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

interface AvisoRapido {
  id: number;
  texto: string;
  accion?: { etiqueta: string; alHacer: () => void };
}

const Contexto = createContext<{ mostrar: (texto: string, accion?: AvisoRapido["accion"]) => void }>({ mostrar: () => {} });

export function useAvisos() {
  return useContext(Contexto);
}

/** Aviso breve con "Deshacer". Se anuncia a lectores de pantalla y se queda 7 segundos. */
export function ProveedorAvisos({ children }: { children: React.ReactNode }) {
  const [aviso, setAviso] = useState<AvisoRapido | null>(null);
  const contador = useRef(0);
  const temporizador = useRef<number | undefined>(undefined);

  const mostrar = useCallback((texto: string, accion?: AvisoRapido["accion"]) => {
    window.clearTimeout(temporizador.current);
    contador.current += 1;
    setAviso({ id: contador.current, texto, accion });
    temporizador.current = window.setTimeout(() => setAviso(null), 7000);
  }, []);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);
  const valor = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="no-imprimir pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex w-full max-w-md justify-center px-6"
      >
        {aviso && (
            <div
              key={aviso.id}
              className="aviso-entrada pointer-events-auto flex w-full items-center gap-3 rounded-control bg-tinta py-2 pl-4 pr-2 text-cuerpo font-bold text-papel shadow-calida"
            >
              <span className="flex-1">{aviso.texto}</span>
              {aviso.accion && (
                <button
                  type="button"
                  onClick={() => {
                    aviso.accion?.alHacer();
                    setAviso(null);
                  }}
                  className="min-h-11 rounded-chip px-4 text-cuerpo font-black text-naranja underline underline-offset-4"
                >
                  {aviso.accion.etiqueta}
                </button>
              )}
            </div>
        )}
      </div>
    </Contexto.Provider>
  );
}
