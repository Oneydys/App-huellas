"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BannerDemo } from "@/components/banner-demo";
import { Marco } from "@/components/marco";
import { NavInferior } from "@/components/nav-inferior";
import { ProveedorRegistroRapido } from "@/components/registro-rapido";
import { ProveedorAvisos } from "@/components/toast";
import { Aviso } from "@/components/ui/aviso";
import { PantallaCargando } from "@/components/ui/esqueleto";
import { guardadoFallo } from "@/lib/store/store";
import { useHuellas } from "@/lib/store/hooks";

/** Marco común de /app: exige acceso, muestra el aviso de demo y la navegación inferior. */
export function CapaApp({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { listo, estado } = useHuellas();
  const sinAcceso = listo && !estado.accesoSimulado;

  // Orden de la ruta: sin acceso se vuelve al onboarding (o al acceso si ya hay una mascota).
  useEffect(() => {
    if (sinAcceso) router.replace(estado.mascotas.length > 0 ? "/acceso" : "/onboarding");
  }, [sinAcceso, estado.mascotas.length, router]);

  return (
    <ProveedorAvisos>
      <ProveedorRegistroRapido>
        <Marco conNav>
          {listo && !sinAcceso ? (
            <>
              {guardadoFallo() && (
                <Aviso tono="aviso" className="no-imprimir mb-4">
                  No pudimos guardar en este dispositivo (¿sin espacio o navegación privada?). Descarga una copia desde Perfil para no
                  perder tus datos.
                </Aviso>
              )}
              <BannerDemo />
              {children}
            </>
          ) : (
            <PantallaCargando />
          )}
        </Marco>
        <NavInferior />
      </ProveedorRegistroRapido>
    </ProveedorAvisos>
  );
}
