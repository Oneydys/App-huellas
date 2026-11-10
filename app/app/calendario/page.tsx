"use client";

import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ChipsCuidado } from "@/components/cuidado";
import { IconoTipo } from "@/components/iconos";
import { useRegistroRapido } from "@/components/registro-rapido";
import { SelectorMascota } from "@/components/selector-mascota";
import { SinMascota } from "@/components/sin-mascota";
import { Aviso } from "@/components/ui/aviso";
import { Aparece, Escalonado } from "@/components/ui/aparece";
import { Boton } from "@/components/ui/boton";
import { useHechoHoy } from "@/components/use-hecho-hoy";
import { AreaTexto, Campo, Selector } from "@/components/ui/campo";
import { Hoja } from "@/components/ui/hoja";
import type { PropuestaCuidado } from "@/lib/calendario-vivo";
import { cn } from "@/lib/cn";
import { CATEGORIAS_CUIDADO, crearCuidado, ETIQUETA_CATEGORIA, type CategoriaCuidado } from "@/lib/cuidados";
import {
  anioMes,
  describirDias,
  formatearFecha,
  nombreDeMes,
  semanasDelMes,
  sumarDias,
  type FechaISO,
} from "@/lib/fechas";
import { nombreDePais } from "@/lib/paises";
import { PLANTILLA } from "@/lib/plantilla";
import { nuevoId } from "@/lib/store/hooks";
import { useVistaMascota } from "@/lib/store/vistas";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

const GRUPOS: { id: string; titulo: string; cuando: (p: PropuestaCuidado) => boolean }[] = [
  { id: "pasada", titulo: "Para revisar (pasó la fecha)", cuando: (p) => p.estado === "pasada" },
  { id: "pronto", titulo: "Próximos 30 días", cuando: (p) => p.estado === "hoy" || p.estado === "proxima" },
  { id: "luego", titulo: "Sin fechas pasadas · más adelante", cuando: (p) => p.estado === "lejana" },
  { id: "dia", titulo: "Ese día", cuando: () => true },
];

function FormularioCuidado({
  mascotaId,
  hoy,
  fechaInicial,
  alGuardar,
}: {
  mascotaId: string;
  hoy: FechaISO;
  fechaInicial: FechaISO;
  alGuardar: (cuidado: Parameters<typeof crearCuidado>[0]) => Record<string, string> | null;
}) {
  const [categoria, setCategoria] = useState<CategoriaCuidado>("visita");
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(fechaInicial);
  const [nota, setNota] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setErrores(alGuardar({ mascotaId, categoria, titulo: titulo.trim() || ETIQUETA_CATEGORIA[categoria], fecha, nota }) ?? {});
      }}
    >
      <Selector
        etiqueta="¿Qué cuidado es?"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value as CategoriaCuidado)}
      >
        {CATEGORIAS_CUIDADO.map((c) => (
          <option key={c} value={c}>
            {ETIQUETA_CATEGORIA[c]}
          </option>
        ))}
      </Selector>
      <Campo
        etiqueta="Título (opcional)"
        value={titulo}
        maxLength={60}
        placeholder={ETIQUETA_CATEGORIA[categoria]}
        error={errores.titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <Campo
        etiqueta="Fecha"
        type="date"
        value={fecha}
        min={hoy}
        error={errores.fecha}
        onChange={(e) => setFecha(e.target.value)}
      />
      <AreaTexto etiqueta="Nota (opcional)" value={nota} maxLength={280} onChange={(e) => setNota(e.target.value)} />
      <Aviso>Huellas no envía avisos: este cuidado aparecerá en tu calendario y en el inicio.</Aviso>
      <Boton type="submit">Programar cuidado</Boton>
    </form>
  );
}

function FilaCuidado({
  p,
  alEliminar,
  alHecho,
  alAnotarPeso,
}: {
  p: PropuestaCuidado;
  alEliminar: (id: string) => void;
  alHecho: (p: PropuestaCuidado) => void;
  alAnotarPeso: () => void;
}) {
  return (
    <li className="rounded-tarjeta border border-linea bg-papel p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-control bg-hundido text-naranja">
          <IconoTipo tipo={p.categoria} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-cuerpo font-black">{p.titulo}</h3>
          <p className="text-cuerpo font-bold">
            {describirDias(p.diasRestantes)} · {formatearFecha(p.fecha)}
          </p>
        </div>
      </div>
      {p.detalle && <p className="mt-2 text-cuerpo text-suave-texto">{p.detalle}</p>}
      <div className="mt-3">
        <ChipsCuidado propuesta={p} />
      </div>
      {p.orientativo && <p className="mt-2 text-cuerpo font-bold text-aviso">{PLANTILLA.textos.avisoOrientativo}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {p.categoria === "peso" ? (
          <Boton variante="secundario" className="min-h-11 px-4 text-cuerpo" onClick={alAnotarPeso}>
            Anotar su peso
          </Boton>
        ) : p.categoria !== "medicamento" ? (
          <Boton variante="secundario" className="min-h-11 px-4 text-cuerpo" onClick={() => alHecho(p)}>
            <Check aria-hidden className="size-4" />
            Hecho hoy
          </Boton>
        ) : null}
        {p.cuidadoId && (
          <button
            type="button"
            onClick={() => alEliminar(p.cuidadoId as string)}
            className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-cuerpo font-black text-error"
          >
            <Trash2 aria-hidden className="size-4" />
            Quitar
          </button>
        )}
      </div>
    </li>
  );
}

export default function Calendario() {
  const { mascota, hoy, calendario, despachar } = useVistaMascota();
  const hechoHoy = useHechoHoy();
  const { abrir } = useRegistroRapido();
  const [visible, setVisible] = useState<{ anio: number; mes: number } | null>(null);
  const [dia, setDia] = useState<FechaISO | null>(null);
  const [programando, setProgramando] = useState(false);

  if (!mascota || !calendario) return <SinMascota />;

  const { anio, mes } = visible ?? anioMes(hoy);
  const semanas = semanasDelMes(anio, mes);
  const porFecha = new Map<FechaISO, PropuestaCuidado[]>();
  for (const p of calendario.propuestas) porFecha.set(p.fecha, [...(porFecha.get(p.fecha) ?? []), p]);

  const lista = dia ? (porFecha.get(dia) ?? []) : calendario.propuestas;
  const moverMes = (delta: number) => {
    const d = new Date(Date.UTC(anio, mes - 1 + delta, 1));
    setVisible({ anio: d.getUTCFullYear(), mes: d.getUTCMonth() + 1 });
    setDia(null);
  };
  const cal = calendario.calendarioPais;

  return (
    <Escalonado className="flex flex-col gap-6">
      <Aparece className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-etiqueta font-black tracking-wider text-suave-texto">CALENDARIO VIVO</p>
            <h1 className="text-display font-black tracking-tight">Cuidados de {mascota.nombre}</h1>
          </div>
        </div>
        <SelectorMascota />
        <Aviso tono="aviso">
          {PLANTILLA.textos.avisoOrientativo}{" "}
          {cal
            ? `Calendario de ${nombreDePais(mascota.pais)} cargado por quien administra la app; revisa sus fuentes: ${cal.fuentes.map((f) => f.nombre).join(", ")}.`
            : PLANTILLA.textos.avisoCalendarioGenerico}
        </Aviso>
      </Aparece>

      <Aparece className="rounded-tarjeta border border-linea bg-papel p-4">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            aria-label="Mes anterior"
            onClick={() => moverMes(-1)}
            className="grid size-11 place-items-center rounded-control bg-hundido"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <h2 className="text-cuerpo font-black" aria-live="polite">
            {nombreDeMes(anio, mes)}
          </h2>
          <button
            type="button"
            aria-label="Mes siguiente"
            onClick={() => moverMes(1)}
            className="grid size-11 place-items-center rounded-control bg-hundido"
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-etiqueta font-black text-suave-texto" aria-hidden>
          {DIAS.map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {semanas.flat().map(({ fecha, delMes }) => {
            const cuidados = porFecha.get(fecha) ?? [];
            const esHoy = fecha === hoy;
            const elegido = fecha === dia;
            return (
              <button
                key={fecha}
                type="button"
                aria-pressed={elegido}
                aria-label={`${formatearFecha(fecha)}${esHoy ? ", hoy" : ""}${cuidados.length ? `, ${cuidados.length} cuidado${cuidados.length > 1 ? "s" : ""}` : ""}`}
                onClick={() => setDia(elegido ? null : fecha)}
                className={cn(
                  "relative grid aspect-square min-h-11 place-items-center rounded-control text-cuerpo font-bold transition-colors duration-200",
                  !delMes && "font-normal text-suave-texto",
                  esHoy && !elegido && "bg-hundido font-black ring-2 ring-naranja",
                  elegido && "bg-naranja font-black text-tinta",
                )}
              >
                {Number(fecha.slice(8))}
                {cuidados.length > 0 && (
                  <span
                    aria-hidden
                    className={cn("absolute bottom-1 size-1.5 rounded-full", elegido ? "bg-tinta" : "bg-naranja-hondo")}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-titulo font-black">{dia ? formatearFecha(dia, "corta") : "Próximos cuidados"}</h2>
          <Boton variante="secundario" className="min-h-11 px-4 text-cuerpo" onClick={() => setProgramando(true)}>
            <Plus aria-hidden className="size-4" />
            Programar
          </Boton>
        </div>
        {lista.length === 0 ? (
          <p className="rounded-tarjeta bg-hundido p-4 text-cuerpo text-suave-texto">
            {dia ? "No hay cuidados ese día." : "Aún no hay cuidados propuestos."}{" "}
            {dia && (
              <button type="button" onClick={() => setDia(null)} className="font-black text-tinta underline underline-offset-4">
                Ver todos
              </button>
            )}
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {GRUPOS.map((g) => {
              // Sin día elegido, el grupo «Ese día» (que acepta todo) no se muestra: evita repetir la lista entera.
              const items = lista.filter((p) => (dia ? g.id === "dia" : g.id !== "dia" && g.cuando(p)));
              if (items.length === 0) return null;
              return (
                <section key={g.id} aria-label={g.titulo} className="flex flex-col gap-3">
                  {!dia && <h3 className="text-cuerpo font-black text-suave-texto">{g.titulo}</h3>}
                  <ul className="flex flex-col gap-3">
                    {items.map((p) => (
                      <FilaCuidado
                        key={p.id}
                        p={p}
                        alEliminar={(id) => despachar({ tipo: "cuidado/eliminar", id })}
                        alHecho={hechoHoy}
                        alAnotarPeso={() => abrir({ tipo: "peso" })}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </Aparece>

      <Hoja abierta={programando} titulo={`Programar para ${mascota.nombre}`} alCerrar={() => setProgramando(false)}>
        <FormularioCuidado
          mascotaId={mascota.id}
          hoy={hoy}
          fechaInicial={dia && dia >= hoy ? dia : sumarDias(hoy, 7)}
          alGuardar={(datos) => {
            const r = crearCuidado(datos, { id: nuevoId("c"), hoy });
            if (!r.ok) return r.errores;
            despachar({ tipo: "cuidado/programar", cuidado: r.cuidado });
            setProgramando(false);
            return null;
          }}
        />
      </Hoja>
    </Escalonado>
  );
}
