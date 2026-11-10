"use client";

import { useSyncExternalStore } from "react";
import { Marco } from "@/components/marco";
import { PantallaCargando } from "@/components/ui/esqueleto";
import { Logotipo, MascotaAvatar } from "@/components/ui/mascota-avatar";
import { ETIQUETA_ESPECIE, personajePorId } from "@/lib/personajes";
import { leerDatosEncontrada } from "@/lib/qr";

// Los datos llegan en el fragmento (#…) del enlace del QR. El navegador no envía el fragmento al servidor,
// así que esta página no necesita base de datos ni cuentas: funciona en cualquier teléfono.
function suscribirFragmento(avisar: () => void) {
  window.addEventListener("hashchange", avisar);
  return () => window.removeEventListener("hashchange", avisar);
}
const fragmentoActual = () => window.location.hash;

/** Página de quien encuentra una mascota. Solo muestra lo que identifica a la mascota: nunca teléfono ni dueño. */
export function Encontrada({ codigo }: { codigo: string }) {
  // En el servidor (y antes de hidratar) el valor es null: se muestra la carga, no un mensaje falso.
  const fragmento = useSyncExternalStore<string | null>(suscribirFragmento, fragmentoActual, () => null);

  if (fragmento === null) {
    return (
      <Marco>
        <header>
          <Logotipo />
        </header>
        <div className="mt-6">
          <PantallaCargando />
        </div>
      </Marco>
    );
  }

  const datos = leerDatosEncontrada(fragmento);

  if (!datos) {
    return (
      <Marco>
        <header>
          <Logotipo />
        </header>
        <h1 className="mt-6 text-display font-black tracking-tight">Este código no trae datos de la mascota</h1>
        <p className="mt-2 text-cuerpo text-suave-texto">
          Si encontraste a una mascota, revisa si tiene una tarjeta con un número impreso y llama a ese número.
        </p>
      </Marco>
    );
  }

  const especie = ETIQUETA_ESPECIE[personajePorId(datos.personaje).especie];
  const codigoValido = /^HU-[0-9A-Z]{1,16}$/.test(codigo);

  return (
    <Marco>
      <header>
        <Logotipo />
      </header>
      <h1 className="mt-6 break-words text-display font-black tracking-tight">Encontraste a {datos.nombre}</h1>
      <p className="mt-2 text-cuerpo text-suave-texto">Gracias por ayudar. Esta página no guarda nada y no te pide datos.</p>

      <section aria-label="Datos de la mascota" className="mt-6 flex flex-col items-center gap-3 rounded-tarjeta bg-hundido p-6 text-center">
        <div className="grid size-28 place-items-center overflow-hidden rounded-full border-4 border-naranja bg-papel">
          <MascotaAvatar personaje={datos.personaje} tamano={104} priority />
        </div>
        <h2 className="break-words text-titulo font-black">{datos.nombre}</h2>
        <p className="text-cuerpo font-bold">
          {especie} · {datos.raza}
        </p>
        {codigoValido && (
          <div className="mt-1">
            <p className="text-etiqueta font-black tracking-wider text-suave-texto">CÓDIGO DEL CARNET</p>
            <p className="text-cuerpo font-black tracking-wider">{codigo}</p>
          </div>
        )}
      </section>

      <section aria-labelledby="que-hacer" className="mt-6">
        <h2 id="que-hacer" className="text-titulo font-black">
          Qué hacer ahora
        </h2>
        <ol className="mt-3 flex list-decimal flex-col gap-3 pl-5 text-cuerpo">
          <li>Si es seguro, llévala a una veterinaria o a un refugio cercano. Pueden revisar si tiene microchip.</li>
          <li>Si su tarjeta tiene un número impreso, llama a ese número para avisar a su familia.</li>
        </ol>
      </section>
    </Marco>
  );
}
