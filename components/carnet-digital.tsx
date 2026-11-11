"use client";

import { Camera, Share2 } from "lucide-react";
import { useRef } from "react";
import { CodigoQr } from "@/components/codigo-qr";
import { useAvisos } from "@/components/toast";
import { Chip } from "@/components/ui/chip";
import { MascotaAvatar } from "@/components/ui/mascota-avatar";
import type { DatosCarnet } from "@/lib/compartir";
import { reducirFoto } from "@/lib/foto";
import { codigoMascota, type Mascota } from "@/lib/mascota";
import { PLANTILLA } from "@/lib/plantilla";
import { personajePorId } from "@/lib/personajes";
import { datosDeIdentificacion } from "@/lib/qr";
import { useHuellas } from "@/lib/store/hooks";

/** El carnet de la mascota como pieza propia: foto o personaje, datos y estado de vacunas según sus registros. */
export function CarnetDigital({ mascota, datos, alCompartir }: { mascota: Mascota; datos: DatosCarnet; alCompartir: () => void }) {
  const { despachar } = useHuellas();
  const { mostrar } = useAvisos();
  const entrada = useRef<HTMLInputElement>(null);
  const personaje = personajePorId(mascota.personaje);

  async function alElegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    const r = await reducirFoto(archivo);
    if (!r.ok) return mostrar(r.error);
    despachar({ tipo: "mascota/editar", id: mascota.id, cambios: { foto: r.foto } });
    mostrar("Foto guardada en este dispositivo.", {
      etiqueta: "Quitar",
      alHacer: () => despachar({ tipo: "mascota/editar", id: mascota.id, cambios: { foto: undefined } }),
    });
  }

  return (
    <article
      aria-label={`Carnet digital de ${mascota.nombre}`}
      className="overflow-hidden rounded-tarjeta border border-linea bg-papel shadow-calida"
    >
      <header className="relative bg-gradient-to-br from-naranja-claro to-naranja-hondo px-6 pb-16 pt-4 text-tinta">
        <div className="flex items-center justify-between gap-3">
          <p className="text-etiqueta font-black tracking-wider">PELUVET · CARNET DE SALUD</p>
          {mascota.origen === "demo" && <Chip data-captura="oculto">DEMO</Chip>}
        </div>
        <button
          type="button"
          onClick={alCompartir}
          className="absolute right-4 top-12 inline-flex min-h-11 items-center gap-2 rounded-control bg-papel px-4 text-cuerpo font-black text-tinta shadow-calida transition-transform duration-[120ms] active:scale-95"
        >
          <Share2 aria-hidden className="size-4" />
          Compartir
        </button>
      </header>

      <div className="relative -mt-14 px-6 pb-6">
        <div className="relative size-28">
          <div className="grid size-28 place-items-center overflow-hidden rounded-full border-4 border-papel bg-hundido shadow-calida">
            <MascotaAvatar personaje={mascota.personaje} foto={mascota.foto} tamano={mascota.foto ? 112 : 104} priority />
          </div>
          <button
            type="button"
            onClick={() => entrada.current?.click()}
            aria-label={mascota.foto ? "Cambiar la foto" : "Agregar una foto"}
            className="absolute -bottom-1 -right-1 grid size-11 place-items-center rounded-full bg-tinta text-papel shadow-calida"
          >
            <Camera aria-hidden className="size-5" />
          </button>
          <input ref={entrada} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden aria-label="Elegir una foto de la mascota" onChange={alElegirFoto} />
        </div>

        <h1 className="mt-4 break-words text-display font-black tracking-tight">{datos.nombre}</h1>
        <p className="mt-1 text-cuerpo font-bold">{datos.linea1}</p>
        <p className="text-cuerpo text-suave-texto">{datos.linea2}</p>

        {/* El código (HU-…, unos 143 px en negrita) no cabe en la columna de 3fr por debajo de 400 px: entonces ocupa una fila entera. */}
        <dl className="mt-4 grid grid-cols-1 gap-3 text-cuerpo min-[400px]:grid-cols-[2fr_3fr]">
          <div className="min-w-0 rounded-control bg-hundido p-3">
            <dt className="text-etiqueta text-suave-texto">Último peso</dt>
            <dd className="font-black">{datos.peso}</dd>
          </div>
          <div className="min-w-0 rounded-control bg-hundido p-3">
            <dt className="text-etiqueta text-suave-texto">Código del carnet</dt>
            <dd className="whitespace-nowrap font-black tracking-normal">{datos.codigo}</dd>
          </div>
        </dl>

        <div className="mt-3 rounded-control border border-linea p-3">
          <p className="text-etiqueta text-suave-texto">Vacunas</p>
          <p className="text-cuerpo font-black">{datos.vacunas.estado}</p>
          <p className="text-cuerpo text-suave-texto">{datos.vacunas.detalle}</p>
        </div>

        {/* Por debajo de 400 px el QR va encima del texto: en fila, la columna de texto quedaba demasiado estrecha. */}
        <div className="mt-3 flex flex-col items-start gap-3 rounded-control border border-linea p-3 min-[400px]:flex-row min-[400px]:items-center min-[400px]:gap-4">
          <CodigoQr
            codigo={codigoMascota(mascota.id)}
            datos={datosDeIdentificacion(mascota)}
            etiqueta={`Código QR de identificación de ${mascota.nombre}`}
            className="size-24 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-etiqueta text-suave-texto">Identificación</p>
            <p className="text-cuerpo font-black">Escanéalo para ver su nombre y su especie.</p>
            <p className="text-cuerpo text-suave-texto">No muestra tus datos de contacto.</p>
          </div>
        </div>

        <p className="mt-3 text-cuerpo text-suave-texto">
          Dije: {personaje.dije}. {PLANTILLA.textos.avisoNoVeterinario}
        </p>
      </div>
    </article>
  );
}
