"use client";

import { Chip } from "@/components/ui/chip";
import { MascotaAvatar } from "@/components/ui/mascota-avatar";
import { describirEdad, razaOMestizo, type Mascota } from "@/lib/mascota";
import { nombreDePais } from "@/lib/paises";
import { personajePorId } from "@/lib/personajes";

/** Portada de la mascota: escenario naranja con el personaje en primer plano. El nombre se ve siempre. */
export function TarjetaCarnet({
  mascota,
  hoy,
  etiqueta = "CARNET DE SALUD",
}: {
  mascota: Mascota;
  hoy: string;
  etiqueta?: string;
}) {
  const personaje = personajePorId(mascota.personaje);
  const nombreLargo = mascota.nombre.length > 6;
  return (
    <section
      aria-label={`Carnet de ${mascota.nombre}`}
      className="relative flex min-h-56 items-stretch overflow-hidden rounded-tarjeta bg-gradient-to-br from-naranja-claro to-naranja-hondo p-6 text-tinta shadow-calida"
    >
      {/* Huellas decorativas del escenario */}
      <svg aria-hidden viewBox="0 0 120 120" className="pointer-events-none absolute -right-6 -top-6 size-40 fill-papel/20">
        <ellipse cx="60" cy="78" rx="22" ry="18" />
        <ellipse cx="32" cy="52" rx="9" ry="12" />
        <ellipse cx="52" cy="38" rx="9" ry="12" />
        <ellipse cx="74" cy="38" rx="9" ry="12" />
        <ellipse cx="94" cy="52" rx="9" ry="12" />
      </svg>
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center pr-2">
        <p className="text-etiqueta font-black tracking-wider">{etiqueta}</p>
        <h1
          className={
            nombreLargo
              ? "mt-1 break-words text-titulo font-black tracking-tight"
              : "mt-1 text-display font-black tracking-tight"
          }
        >
          {mascota.nombre}
        </h1>
        <p className="mt-2 text-cuerpo font-bold">
          {razaOMestizo(mascota)} · {describirEdad(mascota, hoy)}
        </p>
        <p className="text-cuerpo font-bold">{nombreDePais(mascota.pais)}</p>
        <p className="mt-2 text-cuerpo font-bold">
          {/* El dije va en turquesa, el único color secundario de la marca, para que se distinga del collar. Punto en línea: así el texto se equilibra. */}
          <span aria-hidden className="mr-2 inline-block size-3 rounded-full bg-turquesa align-middle ring-2 ring-papel" />
          Dije: {personaje.dije}
        </p>
        {mascota.origen === "demo" && (
          <Chip data-captura="oculto" className="mt-2 self-start">
            DEMO
          </Chip>
        )}
      </div>
      {/* Personaje protagonista: casi la mitad del bloque, con un halo claro detrás para que el collar resalte. */}
      <div className="relative z-0 -mb-2 -mr-2 self-end">
        <span aria-hidden className="escenario-personaje absolute -inset-3" />
        <div className="flotar relative">
          {/* Tamaño fluido: en 320 px el personaje mide 120 px y deja sitio al nombre y a los datos (el tamaño inline se sustituye con !). */}
          <MascotaAvatar personaje={mascota.personaje} tamano={168} priority className="!size-[clamp(120px,36vw,168px)]" />
        </div>
      </div>
    </section>
  );
}
