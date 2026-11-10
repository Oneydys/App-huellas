"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { GraficoPeso } from "@/components/grafico-peso";
import { IconoTipo } from "@/components/iconos";
import { SelectorMascota } from "@/components/selector-mascota";
import { SinMascota } from "@/components/sin-mascota";
import { Aviso } from "@/components/ui/aviso";
import { Boton, BotonLink } from "@/components/ui/boton";
import { AreaTexto, Campo, Selector } from "@/components/ui/campo";
import { describirDias, formatearFecha } from "@/lib/fechas";
import { cn } from "@/lib/cn";
import {
  crearRegistro,
  ETIQUETA_TIPO,
  historialDePeso,
  parsearKg,
  TIPOS_REGISTRO,
  type Registro,
  type TipoRegistro,
} from "@/lib/registros";
import { nuevoId } from "@/lib/store/hooks";
import { useVistaMascota } from "@/lib/store/vistas";

type Valores = Record<string, string>;

function armarDatos(tipo: TipoRegistro, v: Valores, mascotaId: string): Record<string, unknown> {
  const comun = { mascotaId, tipo, fecha: v.fecha };
  switch (tipo) {
    case "vacuna":
      return { ...comun, nombre: v.nombre, proximaFecha: v.proximaFecha || undefined, nota: v.nota };
    case "desparasitacion":
      return { ...comun, via: v.via || undefined, producto: v.producto, nota: v.nota };
    case "peso":
      return { ...comun, kg: parsearKg(v.kg ?? ""), nota: v.nota };
    case "visita":
      return { ...comun, motivo: v.motivo, lugar: v.lugar, nota: v.nota };
    case "observacion":
      return { ...comun, texto: v.texto };
    case "medicamento":
      return { ...comun, nombre: v.nombre, dosis: v.dosis, fin: v.fin || undefined, nota: v.nota };
  }
}

const esTipo = (valor: string | null): valor is TipoRegistro =>
  valor !== null && (TIPOS_REGISTRO as readonly string[]).includes(valor);

export interface OpcionesRegistro {
  tipo?: string | null;
  cuidadoId?: string | null;
}

interface Props extends OpcionesRegistro {
  /** Dentro de la hoja rápida no hay título propio ni enlace al carnet. */
  enHoja?: boolean;
  alTerminar?: () => void;
}

export function FormularioRegistro({ tipo: tipoParam = null, cuidadoId = null, enHoja = false, alTerminar }: Props) {
  const { mascota, hoy, calendario, registros, despachar } = useVistaMascota();
  const [tipo, setTipo] = useState<TipoRegistro>(esTipo(tipoParam) ? tipoParam : "peso");
  const [valores, setValores] = useState<Valores>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardado, setGuardado] = useState<Registro | null>(null);

  if (!mascota) return <SinMascota />;

  const v = (campo: string) => valores[campo] ?? "";
  const poner = (campo: string) => (e: { target: { value: string } }) => {
    setValores((prev) => ({ ...prev, [campo]: e.target.value }));
    setErrores((prev) => ({ ...prev, [campo]: "" }));
  };
  const fecha = valores.fecha ?? hoy;

  function cambiarTipo(t: TipoRegistro) {
    setTipo(t);
    setValores({});
    setErrores({});
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!mascota) return;
    const r = crearRegistro(armarDatos(tipo, { ...valores, fecha }, mascota.id), { id: nuevoId("r"), hoy });
    if (!r.ok) return setErrores(r.errores);
    despachar({ tipo: "registro/agregar", registro: r.registro });
    if (cuidadoId) despachar({ tipo: "cuidado/completar", id: cuidadoId, fecha: hoy });
    setGuardado(r.registro);
  }

  if (guardado) {
    const siguiente = calendario?.propuestas.find((p) => p.categoria === guardado.tipo);
    const pesos = guardado.tipo === "peso" ? historialDePeso(registros, mascota.id) : [];
    return (
      <section aria-live="polite" className={cn("flex flex-col items-center text-center", enHoja ? "py-2" : "flex-1 justify-center py-8")}>
        <span className="celebrar grid size-20 place-items-center rounded-full bg-naranja text-tinta shadow-boton">
          <Check aria-hidden className="size-10" strokeWidth={3} />
        </span>
        <h2 className="mt-6 text-titulo font-black">Guardado en el carnet de {mascota.nombre}</h2>
        <p className="mt-2 max-w-xs text-cuerpo text-suave-texto">
          {ETIQUETA_TIPO[guardado.tipo]} del {formatearFecha(guardado.fecha)}.
        </p>
        {pesos.length >= 2 && (
          <div className="mt-4 w-full rounded-tarjeta border border-linea bg-papel p-4 text-left">
            <p className="text-cuerpo font-black">Evolución del peso</p>
            <GraficoPeso pesos={pesos} />
          </div>
        )}
        {siguiente && (
          <p className="mt-4 max-w-xs rounded-control bg-hundido p-3 text-cuerpo">
            Calendario Vivo: <strong>{siguiente.titulo}</strong> · {describirDias(siguiente.diasRestantes).toLowerCase()} (
            {formatearFecha(siguiente.fecha, "corta")}). {siguiente.orientativo ? "Orientativo, confirma con tu veterinario." : ""}
          </p>
        )}
        <div className="mt-8 flex w-full flex-col gap-3">
          {enHoja ? (
            <Boton onClick={alTerminar}>Listo</Boton>
          ) : (
            <BotonLink href="/app/carnet">Ver el carnet</BotonLink>
          )}
          <Boton
            variante="secundario"
            onClick={() => {
              setGuardado(null);
              setValores({});
            }}
          >
            Registrar otro
          </Boton>
        </div>
      </section>
    );
  }

  return (
    <div className={cn("flex flex-col", enHoja ? "gap-4" : "gap-6")}>
      <div className="flex flex-col gap-4">
        {!enHoja && (
          <div>
            <p className="text-etiqueta font-black tracking-wider text-suave-texto">REGISTRAR</p>
            <h1 className="text-display font-black tracking-tight">Para {mascota.nombre}</h1>
          </div>
        )}
        <SelectorMascota />
      </div>

      <div role="radiogroup" aria-label="Tipo de registro" className="grid grid-cols-2 gap-2">
        {TIPOS_REGISTRO.map((t) => {
          const activo = t === tipo;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => cambiarTipo(t)}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 rounded-control border-2 px-1 text-center text-cuerpo font-extrabold transition-[transform,border-color,background-color] duration-[120ms] ease-huellas active:scale-95",
                activo ? "border-naranja bg-hundido" : "border-linea bg-papel",
              )}
            >
              <IconoTipo tipo={t} className={cn("size-6", activo ? "text-tinta" : "text-suave-texto")} />
              {ETIQUETA_TIPO[t]}
            </button>
          );
        })}
      </div>

      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        {tipo === "vacuna" && (
          <>
            <Campo data-autofocus etiqueta="¿Qué vacuna fue?" value={v("nombre")} maxLength={60} placeholder="Ejemplo: vacuna múltiple" error={errores.nombre} onChange={poner("nombre")} />
            <Campo
              etiqueta="Próxima dosis (opcional)"
              type="date"
              value={v("proximaFecha")}
              min={fecha}
              error={errores.proximaFecha}
              ayuda="Si tu veterinario te dio una fecha, anótala: el calendario la respetará."
              onChange={poner("proximaFecha")}
            />
          </>
        )}
        {tipo === "desparasitacion" && (
          <>
            <Selector data-autofocus etiqueta="Tipo" value={v("via")} error={errores.via} onChange={poner("via")}>
              <option value="">Elige una opción</option>
              <option value="interna">Interna</option>
              <option value="externa">Externa</option>
              <option value="ambas">Interna y externa</option>
            </Selector>
            <Campo etiqueta="Producto (opcional)" value={v("producto")} maxLength={60} error={errores.producto} onChange={poner("producto")} />
          </>
        )}
        {tipo === "peso" && (
          <Campo
            data-autofocus
            enterKeyHint="done"
            etiqueta="Peso en kilogramos"
            value={v("kg")}
            inputMode="decimal"
            maxLength={8}
            autoComplete="off"
            placeholder="Ejemplo: 4,5"
            error={errores.kg}
            onChange={poner("kg")}
          />
        )}
        {tipo === "visita" && (
          <>
            <Campo data-autofocus etiqueta="Motivo de la visita" value={v("motivo")} maxLength={80} placeholder="Ejemplo: control anual" error={errores.motivo} onChange={poner("motivo")} />
            <Campo etiqueta="Clínica o veterinario (opcional)" value={v("lugar")} maxLength={60} error={errores.lugar} onChange={poner("lugar")} />
          </>
        )}
        {tipo === "observacion" && (
          <AreaTexto
            data-autofocus
            etiqueta="¿Qué observaste?"
            value={v("texto")}
            maxLength={280}
            placeholder="Ejemplo: hoy comió menos de lo habitual"
            error={errores.texto}
            ayuda="Anota lo que ves, sin interpretarlo. Si algo te preocupa, llama a tu veterinario."
            onChange={poner("texto")}
          />
        )}
        {tipo === "medicamento" && (
          <>
            <Campo data-autofocus etiqueta="Medicamento" value={v("nombre")} maxLength={60} error={errores.nombre} onChange={poner("nombre")} />
            <Campo
              etiqueta="Indicación del veterinario (opcional)"
              value={v("dosis")}
              maxLength={80}
              placeholder="Cópiala tal como te la dieron"
              error={errores.dosis}
              ayuda="Huellas nunca sugiere medicamentos ni dosis: solo guarda lo que tu veterinario indicó."
              onChange={poner("dosis")}
            />
            <Campo etiqueta="Hasta cuándo (opcional)" type="date" value={v("fin")} min={fecha} error={errores.fin} onChange={poner("fin")} />
          </>
        )}

        <Campo
          etiqueta={tipo === "medicamento" ? "Fecha de inicio" : "Fecha"}
          type="date"
          value={fecha}
          max={hoy}
          error={errores.fecha}
          onChange={poner("fecha")}
        />
        {tipo !== "observacion" && (
          <AreaTexto etiqueta="Nota (opcional)" value={v("nota")} maxLength={280} error={errores.nota} onChange={poner("nota")} />
        )}
        {Object.values(errores).some(Boolean) && (
          <Aviso tono="aviso">Revisa los campos marcados para poder guardar.</Aviso>
        )}
        <Boton type="submit">Guardar registro</Boton>
      </form>
    </div>
  );
}
