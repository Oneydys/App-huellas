"use client";

import { Copy, Download, Printer } from "lucide-react";
import { useState } from "react";
import { GraficoPeso } from "@/components/grafico-peso";
import { SelectorMascota } from "@/components/selector-mascota";
import { SinMascota } from "@/components/sin-mascota";
import { Aviso } from "@/components/ui/aviso";
import { Aparece, Escalonado } from "@/components/ui/aparece";
import { Boton } from "@/components/ui/boton";
import { Chip } from "@/components/ui/chip";
import { descargarArchivo } from "@/lib/descargar";
import { formatearFecha } from "@/lib/fechas";
import { PLANTILLA } from "@/lib/plantilla";
import { historialDePeso } from "@/lib/registros";
import { construirResumen, resumenATexto } from "@/lib/resumen";
import { useVistaMascota } from "@/lib/store/vistas";

export default function Resumen() {
  const { mascota, hoy, registros } = useVistaMascota();
  const [mensaje, setMensaje] = useState("");

  if (!mascota) return <SinMascota />;
  const resumen = construirResumen(mascota, registros, hoy);
  const texto = resumenATexto(resumen);
  const [datos, ...secciones] = resumen.secciones;
  const pesos = historialDePeso(registros, mascota.id).slice(-6);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setMensaje("Copiado. Ya puedes pegarlo en un mensaje o en un correo.");
    } catch {
      setMensaje("No pudimos copiarlo automáticamente. Usa «Descargar» o selecciona el texto.");
    }
  }

  return (
    <Escalonado className="flex flex-col gap-6">
      <Aparece className="no-imprimir flex flex-col gap-4">
        <SelectorMascota />
        <div>
          <p className="text-etiqueta font-black tracking-wider text-suave-texto">RESUMEN PARA EL VETERINARIO</p>
          <h1 className="text-display font-black tracking-tight">Listo para la consulta</h1>
        </div>
        <Aviso>
          Reúne lo que registraste y cabe en una hoja al imprimirlo. {PLANTILLA.textos.avisoNoVeterinario}
        </Aviso>
      </Aparece>

      <Aparece>
        <article aria-label={resumen.titulo} className="documento rounded-tarjeta border border-linea bg-papel p-4">
          <header className="flex items-start justify-between gap-3 border-b-2 border-tinta pb-3">
            <div>
              <p className="text-etiqueta font-black tracking-wider text-suave-texto">
                {PLANTILLA.nombreApp.toUpperCase()} · RESUMEN PARA EL VETERINARIO
              </p>
              <h2 className="break-words text-titulo font-black">{mascota.nombre}</h2>
            </div>
            <p className="shrink-0 text-right text-cuerpo text-suave-texto">{formatearFecha(hoy)}</p>
          </header>
          {resumen.esDemo && <Chip className="mt-2">DATOS DE DEMOSTRACIÓN</Chip>}

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-cuerpo">
            {datos.lineas.map((l) => {
              const i = l.indexOf(": ");
              return (
                <div key={l}>
                  <dt className="text-etiqueta text-suave-texto">{l.slice(0, i)}</dt>
                  <dd className="break-words font-bold">{l.slice(i + 2)}</dd>
                </div>
              );
            })}
          </dl>

          {pesos.length >= 2 && (
            <div className="mt-3 max-w-xs">
              <GraficoPeso pesos={pesos} />
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {secciones.map((s) => (
              <section key={s.titulo} className="break-inside-avoid">
                <h3 className="border-b border-linea pb-1 text-cuerpo font-black">{s.titulo}</h3>
                <ul className="mt-1 flex flex-col gap-1">
                  {s.lineas.map((l, i) => (
                    <li key={i} className="break-words text-cuerpo">
                      {l}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <p className="mt-4 border-t border-linea pt-2 text-cuerpo text-suave-texto">{resumen.aviso}</p>
        </article>
      </Aparece>

      <Aparece className="no-imprimir flex flex-col gap-3">
        <Boton onClick={() => window.print()}>
          <Printer aria-hidden className="size-5" />
          Imprimir o guardar como PDF
        </Boton>
        <Boton variante="secundario" onClick={copiar}>
          <Copy aria-hidden className="size-5" />
          Copiar texto
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => descargarArchivo(`resumen-${mascota.nombre.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.txt`, texto)}
        >
          <Download aria-hidden className="size-5" />
          Descargar como texto
        </Boton>
        <p role="status" aria-live="polite" className="min-h-5 text-center text-cuerpo text-suave-texto">
          {mensaje}
        </p>
      </Aparece>
    </Escalonado>
  );
}
