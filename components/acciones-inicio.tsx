"use client";

import { useRouter } from "next/navigation";
import { BotonLink, Boton } from "@/components/ui/boton";
import { Esqueleto } from "@/components/ui/esqueleto";
import { crearDemo } from "@/lib/demo";
import { useHuellas } from "@/lib/store/hooks";

/** Botones de la portada: cambian si ya hay una mascota guardada en este dispositivo. El principal mide 64 px en la portada. */
export function AccionesInicio() {
  const router = useRouter();
  const { listo, estado, mascota, hoy, despachar } = useHuellas();
  // Modificador "!" de Tailwind 4: sustituye el mínimo de 56 px de la variante primaria, sin depender del orden del CSS.
  const principal = "min-h-16! md:w-full";

  if (!listo) {
    return (
      <div className="flex flex-col gap-3">
        <Esqueleto className="h-16 rounded-control" />
        <Esqueleto className="h-12 rounded-control" />
      </div>
    );
  }

  if (mascota) {
    return (
      <div className="flex flex-col gap-3">
        <BotonLink id="cta-inicio-arriba" data-evento="inicio-compra" href={estado.accesoSimulado ? "/app" : "/paywall"} className={principal}>
          Continuar con {mascota.nombre}
        </BotonLink>
        <BotonLink id="cta-otra-mascota" data-evento="crear-otra-mascota" href="/onboarding" variante="secundario">
          Crear el carnet de otra mascota
        </BotonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <BotonLink id="cta-inicio-arriba" data-evento="inicio-compra" href="/onboarding" className={principal}>
        Crear el carnet de mi mascota
      </BotonLink>
      <Boton
        id="cta-ver-demo"
        data-evento="ver-demostracion"
        data-captura="oculto"
        variante="secundario"
        onClick={() => {
          // La demo ya trae una mascota, así que salta el onboarding, pero pasa por planes y acceso.
          despachar({ tipo: "demo/cargar", demo: crearDemo(hoy) });
          router.push("/paywall");
        }}
      >
        Ver con datos de demostración
      </Boton>
    </div>
  );
}

/**
 * CTA principal que se repite en la portada (a mitad y al final). Misma acción que el botón de arriba:
 * crear el carnet, o continuar si ya hay una mascota guardada en este dispositivo.
 */
export function CtaPrincipal({ id }: { id: string }) {
  const { listo, estado, mascota } = useHuellas();
  if (!listo) return null;
  return (
    <BotonLink
      id={id}
      data-evento="inicio-compra"
      href={mascota ? (estado.accesoSimulado ? "/app" : "/paywall") : "/onboarding"}
      className="min-h-16! md:w-full"
    >
      {mascota ? `Continuar con ${mascota.nombre}` : "Crear el carnet de mi mascota"}
    </BotonLink>
  );
}
