"use client";

import dynamic from "next/dynamic";
import { Download, FileText, MapPinned, Plus, Share2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CarnetDigital } from "@/components/carnet-digital";
import { useAvisos } from "@/components/toast";
import { GraficoPeso } from "@/components/grafico-peso";
import { IconoTipo } from "@/components/iconos";
import { SelectorMascota } from "@/components/selector-mascota";
import { SinMascota } from "@/components/sin-mascota";
import { Aparece, Escalonado } from "@/components/ui/aparece";
import { Boton, BotonLink } from "@/components/ui/boton";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import { datosDelCarnet, datosParaCompartir } from "@/lib/compartir";
import { descargarArchivo } from "@/lib/descargar";
import { describirDias, diasEntre, formatearFecha } from "@/lib/fechas";
import {
  detalleRegistro,
  ETIQUETA_TIPO,
  formatearKg,
  historialDePeso,
  ordenarRecientes,
  TIPOS_REGISTRO,
  tituloRegistro,
  ultimoRegistro,
  type TipoRegistro,
} from "@/lib/registros";
import { exportarJSON, nombreArchivoCopia } from "@/lib/store/almacen";
import { useVistaMascota } from "@/lib/store/vistas";

// La imagen para compartir (canvas) solo se descarga la primera vez que se abre la hoja.
const HojaCompartirCarnet = dynamic(() => import("@/components/compartir-carnet").then((m) => m.HojaCompartirCarnet));

const TILES: { tipo: Extract<TipoRegistro, "peso" | "vacuna" | "desparasitacion" | "visita">; titulo: string }[] = [
  { tipo: "peso", titulo: "Último peso" },
  { tipo: "vacuna", titulo: "Última vacuna" },
  { tipo: "desparasitacion", titulo: "Última desparasitación" },
  { tipo: "visita", titulo: "Última visita" },
];

export default function Carnet() {
  const { mascota, hoy, registros, calendario, estado, despachar } = useVistaMascota();
  const [filtro, setFiltro] = useState<TipoRegistro | "todo">("todo");
  const { mostrar } = useAvisos();
  const [compartiendo, setCompartiendo] = useState(false);
  const [hojaMontada, setHojaMontada] = useState(false);
  const abrirCompartir = () => {
    setHojaMontada(true);
    setCompartiendo(true);
  };
  const datosCarnet = useMemo(
    () => (mascota && calendario ? datosDelCarnet(mascota, registros, calendario.propuestas, hoy) : null),
    [mascota, calendario, registros, hoy],
  );
  // Lo que sale al compartir: solo la mascota y la marca. Memorizado para no regenerar la imagen en cada render.
  const datosCompartir = useMemo(() => (mascota ? datosParaCompartir(mascota) : null), [mascota]);

  if (!mascota || !datosCarnet || !datosCompartir) return <SinMascota />;

  const recientes = ordenarRecientes(registros);
  const visibles = filtro === "todo" ? recientes : recientes.filter((r) => r.tipo === filtro);
  const pesos = historialDePeso(registros, mascota.id);
  const hace = (fecha: string) => describirDias(diasEntre(hoy, fecha));

  return (
    <Escalonado className="flex flex-col gap-6">
      <Aparece className="flex flex-col gap-4">
        <SelectorMascota />
        <CarnetDigital mascota={mascota} datos={datosCarnet} alCompartir={abrirCompartir} />
        <div className="flex flex-col gap-3">
          <Boton onClick={abrirCompartir}>
            <Share2 aria-hidden className="size-5" />
            Compartir carnet
          </Boton>
          <BotonLink href="/app/carnet/perdida" variante="secundario">
            <MapPinned aria-hidden className="size-5" />
            Tarjeta de mascota perdida
          </BotonLink>
        </div>
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <h2 className="text-titulo font-black">Su salud en datos</h2>
        {/* «desparasitación» necesita unos 112 px: por debajo de 360 px las tarjetas van en una columna. */}
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
          {TILES.map(({ tipo, titulo }) => {
            const r = ultimoRegistro(registros, mascota.id, tipo);
            return (
              <div key={tipo} className="rounded-tarjeta border border-linea bg-papel p-4">
                <p className="text-cuerpo text-suave-texto">{titulo}</p>
                <p className={r ? "mt-1 truncate text-titulo font-black" : "mt-2 text-cuerpo font-black"}>
                  {r ? formatearFecha(r.fecha, "corta") : "Sin registro"}
                </p>
                <p className="text-cuerpo text-suave-texto">
                  {r ? `${tipo === "peso" && r.tipo === "peso" ? `${formatearKg(r.kg)} · ` : ""}${hace(r.fecha)}` : "Aún no agregado"}
                </p>
              </div>
            );
          })}
        </div>
        {pesos.length >= 2 && (
          <div className="rounded-tarjeta border border-linea bg-papel p-4">
            <p className="text-cuerpo font-black">Evolución del peso</p>
            <GraficoPeso pesos={pesos} />
          </div>
        )}
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-titulo font-black">Historial</h2>
          <BotonLink href="/app/registrar" variante="secundario" className="min-h-11 px-4 text-cuerpo">
            <Plus aria-hidden className="size-4" />
            Agregar
          </BotonLink>
        </div>
        <div role="group" aria-label="Filtrar historial" className="-mx-6 flex gap-2 sin-barra overflow-x-auto px-6 pb-1">
          {(["todo", ...TIPOS_REGISTRO] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={filtro === t}
              onClick={() => setFiltro(t)}
              className={cn(
                "min-h-11 shrink-0 rounded-chip px-4 text-cuerpo font-black transition-colors duration-200",
                filtro === t ? "bg-naranja text-tinta" : "bg-hundido text-suave-texto",
              )}
            >
              {t === "todo" ? "Todo" : ETIQUETA_TIPO[t]}
            </button>
          ))}
        </div>

        {visibles.length === 0 ? (
          <div className="rounded-tarjeta bg-hundido p-6 text-center">
            <p className="text-cuerpo font-black">
              {recientes.length === 0 ? `Aún no hay registros de ${mascota.nombre}` : "No hay registros de este tipo"}
            </p>
            <p className="mt-1 text-cuerpo text-suave-texto">
              Agrega una vacuna, un peso o una visita para iniciar su historial.
            </p>
            <BotonLink href="/app/registrar" className="mt-4">
              Agregar el primero
            </BotonLink>
          </div>
        ) : (
          <ol className="flex flex-col rounded-tarjeta border border-linea bg-papel px-4">
            {visibles.map((r) => (
              <li key={r.id} className="flex items-start gap-3 border-b border-hundido py-4 last:border-b-0">
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-control bg-hundido text-naranja">
                  <IconoTipo tipo={r.tipo} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-cuerpo font-black">
                    {tituloRegistro(r)}
                  </p>
                  <p className="text-cuerpo text-suave-texto">
                    {ETIQUETA_TIPO[r.tipo]} · {formatearFecha(r.fecha)}
                  </p>
                  {detalleRegistro(r) && <p className="mt-1 break-words text-cuerpo">{detalleRegistro(r)}</p>}
                  {r.origen === "demo" && <Chip data-captura="oculto" className="mt-2">DEMO</Chip>}
                </div>
                <button
                  type="button"
                  aria-label={`Eliminar ${ETIQUETA_TIPO[r.tipo].toLowerCase()} del ${formatearFecha(r.fecha)}`}
                  onClick={() => {
                    despachar({ tipo: "registro/eliminar", id: r.id });
                    mostrar(`Eliminamos «${ETIQUETA_TIPO[r.tipo]}» del ${formatearFecha(r.fecha, "corta")}.`, {
                      etiqueta: "Deshacer",
                      alHacer: () => despachar({ tipo: "registro/agregar", registro: r }),
                    });
                  }}
                  className="grid size-11 shrink-0 place-items-center rounded-control text-suave-texto"
                >
                  <Trash2 aria-hidden className="size-5" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <BotonLink href="/app/resumen" variante="secundario">
          <FileText aria-hidden className="size-5" />
          Resumen para el veterinario
        </BotonLink>
        <Boton
          variante="fantasma"
          onClick={() => {
            descargarArchivo(nombreArchivoCopia(), exportarJSON(estado), "application/json");
            mostrar("Copia descargada. Guárdala en un lugar seguro.");
          }}
        >
          <Download aria-hidden className="size-5" />
          Descargar mis datos
        </Boton>
      </Aparece>

      {hojaMontada && (
        <HojaCompartirCarnet abierta={compartiendo} alCerrar={() => setCompartiendo(false)} mascota={mascota} datos={datosCompartir} />
      )}

    </Escalonado>
  );
}
