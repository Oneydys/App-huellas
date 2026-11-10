"use client";

import { Boton } from "@/components/ui/boton";
import { Hoja } from "@/components/ui/hoja";
import { useHuellas } from "@/lib/store/hooks";

/** Confirmación para quitar la demostración. Es reversible: se puede volver a cargar desde Perfil. */
export function DialogoQuitarDemo({ abierta, alCerrar }: { abierta: boolean; alCerrar: () => void }) {
  const { despachar } = useHuellas();
  return (
    <Hoja abierta={abierta} titulo="¿Quitar los datos de demostración?" alCerrar={alCerrar}>
      <p className="text-cuerpo text-suave-texto">
        Se quitan las mascotas de ejemplo y todo lo que hayas registrado en ellas. Tus mascotas propias no se tocan, y
        puedes volver a cargar la demostración desde Perfil.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Boton
          onClick={() => {
            despachar({ tipo: "demo/quitar" });
            alCerrar();
          }}
        >
          Quitar demostración
        </Boton>
        <Boton variante="secundario" onClick={alCerrar}>
          Cancelar
        </Boton>
      </div>
    </Hoja>
  );
}
