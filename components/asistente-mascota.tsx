"use client";

import { ArrowLeft, Check, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CuidadoDestacado } from "@/components/cuidado";
import { Boton } from "@/components/ui/boton";
import { Campo, Selector } from "@/components/ui/campo";
import { MascotaAvatar } from "@/components/ui/mascota-avatar";
import { Aviso } from "@/components/ui/aviso";
import { calcularCalendario, cuidadoDestacado, type PropuestaCuidado } from "@/lib/calendario-vivo";
import { hoyISO } from "@/lib/fechas";
import {
  crearMascota,
  describirEdad,
  ETIQUETA_PRIORIDAD,
  nacimientoDesdeEdad,
  PRIORIDADES,
  type Mascota,
  type Prioridad,
} from "@/lib/mascota";
import { PAISES, type CodigoPais } from "@/lib/paises";
import { PERSONAJES, personajePorId, type IdPersonaje } from "@/lib/personajes";
import { PLANTILLA } from "@/lib/plantilla";
import { crearRegistro, parsearKg, type Registro } from "@/lib/registros";
import { nuevoId, useHuellas } from "@/lib/store/hooks";
import { cn } from "@/lib/cn";

// Orden estratégico: promesa y especie → nombre (compromiso) → carnet listo (momento ajá) →
// datos que afinan el calendario → valor y dudas antes del paywall. Ver GUIA-PARA-COMPRADORES.md.
const PASOS = ["personaje", "nombre", "carnet", "edad", "raza", "peso", "resultado"] as const;
type Paso = (typeof PASOS)[number];

interface Borrador {
  personaje: IdPersonaje | null;
  nombre: string;
  anios: number;
  meses: number;
  raza: string;
  pais: CodigoPais | "";
  peso: string;
  prioridad: Prioridad;
}

interface Resultado {
  mascota: Mascota;
  registros: Registro[];
  destacado: PropuestaCuidado | undefined;
}

const INICIAL: Borrador = {
  personaje: null,
  nombre: "",
  anios: 1,
  meses: 0,
  raza: "",
  pais: "",
  peso: "",
  prioridad: "vacuna",
};


function Contador({
  etiqueta,
  valor,
  min,
  max,
  unidad,
  alCambiar,
}: {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  unidad: string;
  alCambiar: (v: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-tarjeta bg-hundido p-4">
      <span className="text-cuerpo font-black">{etiqueta}</span>
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          aria-label={`Menos ${unidad}`}
          disabled={valor <= min}
          onClick={() => alCambiar(valor - 1)}
          className="grid size-11 place-items-center rounded-control bg-papel text-tinta shadow-calida transition-transform duration-[120ms] active:scale-95 disabled:opacity-40"
        >
          <Minus aria-hidden className="size-5" />
        </button>
        <output aria-live="polite" className="text-display font-black tabular-nums">
          {valor}
        </output>
        <button
          type="button"
          aria-label={`Más ${unidad}`}
          disabled={valor >= max}
          onClick={() => alCambiar(valor + 1)}
          className="grid size-11 place-items-center rounded-control bg-papel text-tinta shadow-calida transition-transform duration-[120ms] active:scale-95 disabled:opacity-40"
        >
          <Plus aria-hidden className="size-5" />
        </button>
      </div>
    </div>
  );
}

export function AsistenteMascota({
  modo,
  alTerminar,
}: {
  modo: "inicial" | "agregar";
  alTerminar: () => void;
}) {
  const { despachar } = useHuellas();
  const [paso, setPaso] = useState<Paso>("personaje");
  const [b, setB] = useState<Borrador>(INICIAL);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const primeraVez = useRef(true);

  const indice = PASOS.indexOf(paso);
  const personaje = b.personaje ? personajePorId(b.personaje) : null;
  const nombre = b.nombre.trim();

  // Al cambiar de paso el foco pasa al título: los lectores de pantalla anuncian la novedad.
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    titulo.current?.focus();
    window.scrollTo({ top: 0 });
  }, [paso]);

  function actualizar<K extends keyof Borrador>(campo: K, valor: Borrador[K]) {
    setB((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: "" }));
  }

  function ir(destino: Paso) {
    setErrores({});
    setPaso(destino);
  }

  function continuar() {
    if (paso === "personaje") {
      if (!b.personaje) return setErrores({ personaje: "Elige un personaje para continuar." });
      ir("nombre");
    } else if (paso === "nombre") {
      if (!nombre) return setErrores({ nombre: "Escribe su nombre." });
      if (nombre.length > 24) return setErrores({ nombre: "El nombre admite hasta 24 caracteres." });
      ir("carnet");
    } else if (paso === "carnet") {
      ir("edad");
    } else if (paso === "edad") {
      ir("raza");
    } else if (paso === "raza") {
      if (!b.pais) return setErrores({ pais: "Elige el país donde vive." });
      ir("peso");
    } else if (paso === "peso") {
      construirResultado();
    }
  }

  function construirResultado() {
    if (!b.personaje || !b.pais) return;
    const hoy = hoyISO();
    const kg = parsearKg(b.peso);
    if (kg !== undefined && (Number.isNaN(kg) || kg <= 0 || kg > 120)) {
      return setErrores({ peso: "Escribe un peso válido, como 4,5." });
    }
    const id = nuevoId("m");
    const m = crearMascota(
      {
        nombre,
        especie: personajePorId(b.personaje).especie,
        personaje: b.personaje,
        nacimiento: nacimientoDesdeEdad(b.anios, b.meses, hoy),
        nacimientoAproximado: true,
        raza: b.raza,
        pais: b.pais,
        prioridad: b.prioridad,
      },
      { id, hoy },
    );
    if (!m.ok) return setErrores(m.errores);
    const registros: Registro[] = [];
    if (kg !== undefined) {
      const r = crearRegistro({ mascotaId: id, tipo: "peso", fecha: hoy, kg }, { id: nuevoId("r"), hoy });
      if (r.ok) registros.push(r.registro);
    }
    const { propuestas } = calcularCalendario({ mascota: m.mascota, registros, cuidados: [], hoy });
    setResultado({ mascota: m.mascota, registros, destacado: cuidadoDestacado(propuestas, m.mascota.prioridad) });
    ir("resultado");
  }

  function guardar() {
    if (!resultado) return;
    despachar({ tipo: "mascota/agregar", mascota: resultado.mascota, registros: resultado.registros });
    alTerminar();
  }

  function atras() {
    if (indice > 0) ir(PASOS[indice - 1]);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex min-h-11 items-center justify-between">
        <button
          type="button"
          onClick={atras}
          className={cn(
            "inline-flex min-h-11 items-center gap-1 text-cuerpo font-black text-suave-texto",
            indice === 0 && "invisible",
          )}
          aria-hidden={indice === 0}
          tabIndex={indice === 0 ? -1 : 0}
        >
          <ArrowLeft aria-hidden className="size-4" />
          Atrás
        </button>
        <p className="text-etiqueta font-black tracking-wider text-suave-texto">
          {paso === "resultado" ? "LISTO" : `PASO ${indice + 1} DE ${PASOS.length - 1}`}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={PASOS.length - 1}
        aria-valuenow={indice}
        aria-label="Progreso"
        className="mb-6 mt-2 h-1 overflow-hidden rounded-full bg-hundido"
      >
        <div
          className="h-full rounded-full bg-naranja transition-[width] duration-300 ease-huellas"
          style={{ width: `${((indice + 1) / PASOS.length) * 100}%` }}
        />
      </div>

      <section key={paso} className="entrada-paso flex flex-1 flex-col">
          {paso === "personaje" && (
            <>
              <div className="overflow-hidden rounded-tarjeta bg-gradient-to-br from-naranja-claro to-naranja-hondo p-6 text-tinta">
                <h1 ref={titulo} tabIndex={-1} className="text-display font-black tracking-tight outline-none">
                  Elige a tu compañero
                </h1>
                <p className="mt-2 text-cuerpo font-bold">Crea el historial de tu perro o gato: vacunas, peso y visitas.</p>
                {/* Ilustración de marca: llena la parte baja del bloque naranja. Es decorativa; el texto ya lo explica. */}
                <div className="relative mx-auto mt-4 w-full">
                  <span aria-hidden className="escenario-personaje absolute inset-0" />
                  <Image
                    src="/images/huellas-mascot.png"
                    alt=""
                    width={1368}
                    height={1149}
                    priority
                    sizes="(max-width: 440px) calc(100vw - 96px), 344px"
                    className="relative h-auto w-full drop-shadow-[0_14px_10px_rgba(154,86,30,0.35)]"
                  />
                </div>
              </div>
              <div role="group" aria-label="Personajes" className="mt-6 grid grid-cols-2 gap-3">
                {PERSONAJES.map((p) => {
                  const activo = b.personaje === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={activo}
                      onClick={() => actualizar("personaje", p.id)}
                      className={cn(
                        "relative flex flex-col items-center rounded-tarjeta border-2 bg-hundido p-3 text-left transition-[transform,border-color,box-shadow] duration-[120ms] ease-huellas active:scale-[0.97]",
                        activo ? "border-naranja shadow-calida" : "border-transparent",
                      )}
                    >
                      <MascotaAvatar personaje={p.id} tamano={120} />
                      <span className="mt-1 w-full text-cuerpo font-black">{p.nombre}</span>
                      <span className="w-full text-cuerpo text-suave-texto text-pretty">Dije: {p.dije}</span>
                      {activo && (
                        <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-naranja text-tinta">
                          <Check aria-hidden className="size-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {errores.personaje && (
                <p role="alert" className="mt-3 text-cuerpo font-bold text-error">
                  {errores.personaje}
                </p>
              )}
            </>
          )}

          {paso === "nombre" && personaje && (
            <>
              <h1 ref={titulo} tabIndex={-1} className="text-display font-black tracking-tight outline-none">
                ¿Cómo se <span className="text-aviso">llama</span>?
              </h1>
              <p className="mt-2 text-cuerpo text-suave-texto">
                Así aparecerá en su carnet.
              </p>
              <Campo
                className="mt-6"
                etiqueta="Nombre de tu mascota"
                value={b.nombre}
                maxLength={24}
                autoComplete="off"
                autoFocus
                placeholder={personaje.nombreSugerido}
                error={errores.nombre}
                onChange={(e) => actualizar("nombre", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && continuar()}
              />
              {!nombre && (
                <button
                  type="button"
                  onClick={() => actualizar("nombre", personaje.nombreSugerido)}
                  className="mt-3 min-h-11 self-start rounded-chip bg-hundido px-4 text-cuerpo font-black"
                >
                  Usar «{personaje.nombreSugerido}»
                </button>
              )}
            </>
          )}

          {paso === "carnet" && personaje && (
            <>
              <section
                aria-label={`Carnet de ${nombre}`}
                className="relative -mx-2 min-h-60 overflow-hidden rounded-tarjeta bg-gradient-to-br from-naranja-claro to-naranja-hondo p-6 text-tinta"
              >
                <p className="text-etiqueta font-black tracking-wider">CARNET DE SALUD</p>
                <h1 ref={titulo} tabIndex={-1} className="mt-1 break-words text-display font-black tracking-tight outline-none">
                  {nombre} ya tiene carnet
                </h1>
                <p className="mt-2 max-w-40 text-cuerpo font-bold">{personaje.nombre}</p>
                <MascotaAvatar personaje={personaje.id} tamano={170} priority className="absolute -bottom-2 -right-2" />
              </section>
              <p className="mt-6 text-cuerpo text-suave-texto">
                Su edad y sus datos servirán para proponer fechas orientativas de cuidado.
              </p>
            </>
          )}

          {paso === "edad" && (
            <>
              <h1 ref={titulo} tabIndex={-1} className="text-display font-black tracking-tight outline-none">
                ¿Qué edad tiene <span className="text-aviso">{nombre}</span>?
              </h1>
              <p className="mt-2 text-cuerpo text-suave-texto">
                La edad orienta los cuidados. Puede ser aproximada.
              </p>
              <div className="mt-6 flex gap-3">
                <Contador etiqueta="Años" unidad="años" valor={b.anios} min={0} max={25} alCambiar={(v) => actualizar("anios", v)} />
                <Contador etiqueta="Meses" unidad="meses" valor={b.meses} min={0} max={11} alCambiar={(v) => actualizar("meses", v)} />
              </div>
              <p className="mt-4 text-center text-cuerpo font-bold" aria-live="polite">
                {describirEdad({ nacimiento: nacimientoDesdeEdad(b.anios, b.meses, hoyISO()) }, hoyISO())}
              </p>
            </>
          )}

          {paso === "raza" && (
            <>
              <h1 ref={titulo} tabIndex={-1} className="text-display font-black tracking-tight outline-none">
                ¿Cuál es su raza y dónde vive?
              </h1>
              <p className="mt-2 text-cuerpo text-suave-texto">
                Si {nombre} es mestizo, déjalo vacío: también es perfecto.
              </p>
              <Campo
                className="mt-6"
                etiqueta="Raza o tipo (opcional)"
                value={b.raza}
                maxLength={40}
                autoComplete="off"
                placeholder="Criollo, beagle, persa"
                onChange={(e) => actualizar("raza", e.target.value)}
              />
              <Selector
                className="mt-4"
                etiqueta="País"
                value={b.pais}
                error={errores.pais}
                ayuda="Elegir tu país no activa un calendario sanitario: hasta que esté verificado con fuentes veterinarias, usamos reglas generales."
                onChange={(e) => actualizar("pais", e.target.value as CodigoPais)}
              >
                <option value="">Elige un país</option>
                {PAISES.map((p) => (
                  <option key={p.codigo} value={p.codigo}>
                    {p.nombre}
                  </option>
                ))}
              </Selector>
            </>
          )}

          {paso === "peso" && (
            <>
              <h1 ref={titulo} tabIndex={-1} className="text-display font-black tracking-tight outline-none">
                ¿Cuánto pesa y qué cuidar <span className="text-aviso">primero</span>?
              </h1>
              <Campo
                className="mt-6"
                etiqueta="Peso actual (opcional)"
                value={b.peso}
                inputMode="decimal"
                maxLength={8}
                autoComplete="off"
                placeholder="4,5 kg"
                error={errores.peso}
                ayuda="Si no lo sabes, déjalo vacío y agrégalo cuando lo pesen."
                onChange={(e) => actualizar("peso", e.target.value)}
              />
              <fieldset className="mt-6">
                <legend className="mb-2 text-cuerpo font-black">Cuidado prioritario</legend>
                <div role="radiogroup" aria-label="Cuidado prioritario" className="grid gap-2">
                  {PRIORIDADES.map((p) => {
                    const activo = b.prioridad === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        role="radio"
                        aria-checked={activo}
                        onClick={() => actualizar("prioridad", p)}
                        className={cn(
                          "flex min-h-14 items-center justify-between rounded-control border-2 bg-papel px-4 text-left text-cuerpo font-extrabold transition-[transform,border-color] duration-[120ms] ease-huellas active:scale-[0.98]",
                          activo ? "border-naranja bg-hundido" : "border-linea",
                        )}
                      >
                        {ETIQUETA_PRIORIDAD[p]}
                        {activo && <Check aria-hidden className="size-5 text-aviso" />}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}

          {paso === "resultado" && resultado && (
            <>
              <section
                aria-label={`Carnet de ${resultado.mascota.nombre}`}
                className="relative -mx-2 mb-6 min-h-60 overflow-hidden rounded-tarjeta bg-gradient-to-br from-naranja-claro to-naranja-hondo p-6 text-tinta"
              >
                <p className="text-etiqueta font-black tracking-wider">EL CARNET DE</p>
                <h1 ref={titulo} tabIndex={-1} className="mt-1 text-display font-black tracking-tight outline-none">
                  {resultado.mascota.nombre}
                </h1>
                <p className="mt-2 max-w-40 text-cuerpo font-bold">Ya tiene un lugar para su historia.</p>
                <MascotaAvatar
                  personaje={resultado.mascota.personaje}
                  tamano={190}
                  priority
                  className="absolute -bottom-2 -right-2"
                />
              </section>
              <h2 className="mb-3 text-titulo font-black">Lo próximo para {resultado.mascota.nombre}</h2>
              {resultado.destacado ? (
                <CuidadoDestacado propuesta={resultado.destacado} />
              ) : (
                <Aviso>Agrega un registro y el Calendario Vivo propondrá lo que sigue.</Aviso>
              )}
              <p className="mt-4 text-cuerpo text-suave-texto">
                Llamamos Calendario Vivo a las fechas que se actualizan con cada registro.
              </p>
              <section aria-labelledby="dudas" className="mt-6 rounded-tarjeta bg-hundido p-4">
                <h2 id="dudas" className="text-titulo font-black">
                  ¿Tienes dudas?
                </h2>
                <dl className="mt-3 flex flex-col gap-4">
                  <div>
                    <dt className="text-cuerpo font-black">¿Es seguro?</dt>
                    <dd className="mt-1 text-cuerpo text-suave-texto">
                      Tus datos se guardan solo en este navegador, no en un servidor. Puedes descargar una copia cuando quieras.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-cuerpo font-black">¿Tengo tiempo?</dt>
                    <dd className="mt-1 text-cuerpo text-suave-texto">
                      Registra vacunas y peso con el botón +.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-cuerpo font-black">¿Y si no me sirve?</dt>
                    <dd className="mt-1 text-cuerpo text-suave-texto">
                      Lo esencial es gratis. Pro es opcional y suma hasta {PLANTILLA.limites.mascotasPro} mascotas.
                    </dd>
                  </div>
                </dl>
              </section>
            </>
          )}
      </section>

      <div
        className={cn(
          "sticky -mx-6 mt-8 flex flex-col gap-3 bg-papel/95 px-6 pb-4 pt-3 backdrop-blur",
          modo === "agregar" ? "bottom-19" : "bottom-0",
        )}
      >
        {paso === "resultado" ? (
          <>
            <Boton onClick={guardar}>
              {modo === "inicial" ? "Guardar y continuar" : `Guardar a ${resultado?.mascota.nombre ?? "tu mascota"}`}
            </Boton>
            {PLANTILLA.modoSimulacion && (
              <p className="text-center text-cuerpo text-suave-texto">
                Se guarda solo en este dispositivo. {PLANTILLA.textos.avisoOrientativo}
              </p>
            )}
          </>
        ) : (
          <Boton onClick={continuar}>
            {paso === "peso"
              ? "Ver su próximo cuidado"
              : paso === "carnet"
                ? "Completar su calendario"
                : paso === "nombre" && nombre
                ? `Continuar con ${nombre}`
                : paso === "personaje" && !b.personaje
                  ? "Elige un personaje"
                  : "Continuar"}
          </Boton>
        )}
      </div>
    </div>
  );
}
