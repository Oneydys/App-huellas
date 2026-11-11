"use client";

import { Copy, Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAvisos } from "@/components/toast";
import { Boton } from "@/components/ui/boton";
import { AreaTexto } from "@/components/ui/campo";
import { Hoja } from "@/components/ui/hoja";
import { HUELLA_SEMANA } from "@/lib/huella-semana";

type Imagen = { blob: Blob; url: string } | "error" | null;

/** Momento para compartir: abre la tarjeta genérica «Mi huella de la semana». Solo se muestra si la persona la pide. */
export function TarjetaHuella() {
  const [abierta, setAbierta] = useState(false);
  const [puedeCompartirArchivo, setPuedeCompartirArchivo] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          // Se comprueba al abrir, en el gesto de la persona: el navegador decide si acepta archivos.
          setPuedeCompartirArchivo(!!navigator.canShare?.({ files: [new File(["."], "prueba.png", { type: "image/png" })] }));
          setAbierta(true);
        }}
        className="flex w-full items-center gap-3 rounded-tarjeta bg-hundido p-4 text-left transition-transform duration-[120ms] active:scale-[0.98]"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-control bg-papel text-naranja">
          <Share2 aria-hidden className="size-5" />
        </span>
        <span>
          <span className="block text-cuerpo font-black">Comparte tu huella de la semana</span>
          <span className="block text-cuerpo text-suave-texto">Una tarjeta con un mensaje genérico. Tú revisas todo antes de enviarla.</span>
        </span>
      </button>
      <HojaHuella abierta={abierta} alCerrar={() => setAbierta(false)} puedeCompartirArchivo={puedeCompartirArchivo} />
    </>
  );
}

function HojaHuella({
  abierta,
  alCerrar,
  puedeCompartirArchivo,
}: {
  abierta: boolean;
  alCerrar: () => void;
  puedeCompartirArchivo: boolean;
}) {
  const { mostrar } = useAvisos();
  const [imagen, setImagen] = useState<Imagen>(null);
  const [texto, setTexto] = useState<string>(HUELLA_SEMANA.textoPorDefecto);

  useEffect(() => {
    if (!abierta) return;
    let cancelado = false;
    let url = "";
    fetch(HUELLA_SEMANA.rutaImagen)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error("tarjeta");
        return respuesta.blob();
      })
      .then((blob) => {
        if (cancelado) return;
        url = URL.createObjectURL(blob);
        setImagen({ blob, url });
      })
      .catch(() => !cancelado && setImagen("error"));
    return () => {
      cancelado = true;
      if (url) URL.revokeObjectURL(url);
      setImagen(null);
    };
  }, [abierta]);

  const lista = imagen !== null && imagen !== "error" ? imagen : null;
  const archivo = lista ? new File([lista.blob], HUELLA_SEMANA.archivo, { type: "image/png" }) : null;

  async function compartir() {
    if (!archivo) return;
    try {
      await navigator.share({ files: [archivo], text: texto, title: HUELLA_SEMANA.titulo });
    } catch {
      /* la persona cerró el panel de compartir */
    }
  }

  function guardarImagen() {
    if (!lista) return;
    const a = document.createElement("a");
    a.href = lista.url;
    a.download = HUELLA_SEMANA.archivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    mostrar("Imagen guardada en tus descargas.");
  }

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      mostrar("Enlace copiado. Ya puedes pegarlo donde quieras.");
    } catch {
      mostrar("No pudimos copiar el enlace. Copia la dirección de la barra del navegador.");
    }
  }

  return (
    // El foco va a «Cerrar»: el campo de texto abriría el teclado del móvil al mostrar la hoja.
    <Hoja abierta={abierta} titulo="Tu huella de la semana" alCerrar={alCerrar} enfocarCerrar>
      <div className="flex flex-col items-center gap-4">
        <div className="aspect-[4/5] w-44 overflow-hidden rounded-control bg-hundido">
          {lista ? (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa de un blob local
            <img src={lista.url} alt={`${HUELLA_SEMANA.titulo}, tarjeta con la marca Peluvet`} className="size-full object-cover" />
          ) : imagen === "error" ? (
            <p role="alert" className="grid size-full place-items-center p-4 text-center text-cuerpo font-bold text-error">
              No pudimos crear la tarjeta. Cierra y vuelve a intentarlo.
            </p>
          ) : (
            <div role="status" aria-label="Creando la tarjeta" className="esqueleto size-full" />
          )}
        </div>
        <p className="text-center text-cuerpo text-suave-texto" role="status">
          {lista ? "Así se verá. Puedes cambiar el texto de abajo." : imagen === "error" ? "" : "Creando tu tarjeta en este dispositivo…"}
        </p>
      </div>

      <div className="mt-6">
        <AreaTexto
          etiqueta="Texto que acompaña la tarjeta"
          ayuda="Lo escribes tú. Evita nombres, fotos o datos de tu mascota o tu familia."
          value={texto}
          maxLength={280}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {puedeCompartirArchivo ? (
          <Boton onClick={compartir} disabled={!lista}>
            <Share2 aria-hidden className="size-5" />
            Compartir
          </Boton>
        ) : null}
        <Boton variante={puedeCompartirArchivo ? "secundario" : "primario"} onClick={guardarImagen} disabled={!lista}>
          <Download aria-hidden className="size-5" />
          Guardar imagen
        </Boton>
        <Boton variante="secundario" onClick={copiarEnlace}>
          <Copy aria-hidden className="size-5" />
          Copiar enlace
        </Boton>
      </div>
    </Hoja>
  );
}
