"use client";

import { Copy, Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAvisos } from "@/components/toast";
import { Boton } from "@/components/ui/boton";
import { Hoja } from "@/components/ui/hoja";
import { generarImagenCarnet } from "@/lib/carnet-imagen";
import { textoParaCompartir, type DatosCompartibles } from "@/lib/compartir";
import type { Mascota } from "@/lib/mascota";

/** Genera la imagen del carnet en el navegador y la comparte, la guarda o la copia como texto. Solo lleva la mascota y la marca. */
export function HojaCompartirCarnet({
  abierta,
  alCerrar,
  mascota,
  datos,
}: {
  abierta: boolean;
  alCerrar: () => void;
  mascota: Mascota;
  datos: DatosCompartibles;
}) {
  const { mostrar } = useAvisos();
  const [resultado, setResultado] = useState<{ blob: Blob; url: string } | "error" | null>(null);

  useEffect(() => {
    if (!abierta) return;
    let cancelado = false;
    let url = "";
    generarImagenCarnet(datos, { personaje: mascota.personaje, foto: mascota.foto })
      .then((blob) => {
        if (cancelado) return;
        url = URL.createObjectURL(blob);
        setResultado({ blob, url });
      })
      .catch(() => !cancelado && setResultado("error"));
    return () => {
      cancelado = true;
      if (url) URL.revokeObjectURL(url);
      setResultado(null);
    };
  }, [abierta, datos, mascota.personaje, mascota.foto]);

  const lista = resultado !== null && resultado !== "error" ? resultado : null;
  const archivo = lista ? new File([lista.blob], `carnet-${mascota.nombre.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.png`, { type: "image/png" }) : null;
  const texto = textoParaCompartir(datos, mascota.origen === "demo");

  async function compartirImagen() {
    if (!archivo) return;
    try {
      if (navigator.canShare?.({ files: [archivo] })) {
        await navigator.share({ files: [archivo], title: `Carnet de ${mascota.nombre}` });
      } else {
        guardarImagen();
      }
    } catch {
      /* la persona cerró el panel de compartir */
    }
  }

  function guardarImagen() {
    if (!lista || !archivo) return;
    const a = document.createElement("a");
    a.href = lista.url;
    a.download = archivo.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    mostrar("Imagen guardada en tus descargas.");
  }

  async function compartirTexto() {
    try {
      if (navigator.share) await navigator.share({ title: `Carnet de ${mascota.nombre}`, text: texto });
      else {
        await navigator.clipboard.writeText(texto);
        mostrar("Texto copiado. Ya puedes pegarlo donde quieras.");
      }
    } catch {
      /* cancelado */
    }
  }

  return (
    <Hoja abierta={abierta} titulo={`Compartir a ${mascota.nombre}`} alCerrar={alCerrar}>
      <div className="flex flex-col items-center gap-4">
        <div className="aspect-[4/5] w-48 overflow-hidden rounded-control bg-hundido">
          {lista ? (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa de un blob local
            <img src={lista.url} alt={`Imagen del carnet de ${mascota.nombre}`} className="size-full object-cover" />
          ) : resultado === "error" ? (
            <p role="alert" className="grid size-full place-items-center p-4 text-center text-cuerpo font-bold text-error">
              No pudimos crear la imagen. Prueba compartirlo como texto.
            </p>
          ) : (
            <div role="status" aria-label="Creando la imagen" className="esqueleto size-full" />
          )}
        </div>
        <p className="text-center text-cuerpo text-suave-texto">
          La imagen se crea en tu dispositivo. Solo muestra a la mascota y la marca: sin peso, vacunas ni código.
        </p>
        <div className="flex w-full flex-col gap-3">
          <Boton onClick={compartirImagen} disabled={!lista}>
            <Share2 aria-hidden className="size-5" />
            Compartir imagen
          </Boton>
          <Boton variante="secundario" onClick={guardarImagen} disabled={!lista}>
            <Download aria-hidden className="size-5" />
            Guardar imagen
          </Boton>
          <Boton variante="secundario" onClick={compartirTexto}>
            <Copy aria-hidden className="size-5" />
            Compartir como texto
          </Boton>
        </div>
      </div>
    </Hoja>
  );
}
