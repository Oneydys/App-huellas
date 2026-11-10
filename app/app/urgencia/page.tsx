"use client";

import { Siren } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SelectorMascota } from "@/components/selector-mascota";
import { Aviso } from "@/components/ui/aviso";
import { Aparece, Escalonado } from "@/components/ui/aparece";
import { Boton } from "@/components/ui/boton";
import { cn } from "@/lib/cn";
import { etapaDeVida } from "@/lib/mascota";
import { PLANTILLA } from "@/lib/plantilla";
import { evaluarUrgencia, SENALES, type OrientacionUrgencia } from "@/lib/urgencia";
import { useHuellas } from "@/lib/store/hooks";

const TONO: Record<OrientacionUrgencia["nivel"], string> = {
  ahora: "border-error",
  hoy: "border-aviso",
  "sin-senales": "border-linea",
};

export default function Urgencia() {
  const { mascota, hoy } = useHuellas();
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [cria, setCria] = useState<boolean | null>(null);
  const [resultado, setResultado] = useState<OrientacionUrgencia | null>(null);

  const bloque = useRef<HTMLElement>(null);

  // Al mostrar la orientación, el foco y la vista van a ella (y no queda tapada por la navegación).
  useEffect(() => {
    if (!resultado || !bloque.current) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bloque.current.focus({ preventScroll: true });
    bloque.current.scrollIntoView({ block: "center", behavior: reducido ? "auto" : "smooth" });
  }, [resultado]);

  const esCria = cria ?? (mascota ? etapaDeVida(mascota, hoy) === "cria" : false);
  const alternar = (id: string) => {
    setResultado(null);
    setMarcadas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <Escalonado className="flex flex-col gap-6">
      <Aparece className="flex flex-col gap-4">
        <div>
          <p className="text-etiqueta font-black tracking-wider text-suave-texto">ORIENTACIÓN</p>
          <h1 className="text-display font-black tracking-tight">
            ¿Algo te preocupa{mascota ? ` de ${mascota.nombre}` : ""}?
          </h1>
        </div>
        <SelectorMascota />
        <Aviso tono="aviso">
          {PLANTILLA.textos.avisoUrgencia} Esta lista no diagnostica ni reemplaza a un veterinario.
        </Aviso>
      </Aparece>

      <Aparece>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-cuerpo font-black">Marca lo que estás viendo</legend>
          {SENALES.map((s) => {
            const activa = marcadas.includes(s.id);
            return (
              <label
                key={s.id}
                className={cn(
                  "flex min-h-14 cursor-pointer items-center gap-3 rounded-control border-2 bg-papel px-4 py-2 text-cuerpo font-bold transition-colors duration-200",
                  activa ? "border-naranja bg-hundido" : "border-linea",
                )}
              >
                <input type="checkbox" checked={activa} onChange={() => alternar(s.id)} className="size-5 shrink-0 accent-tinta" />
                {s.texto}
              </label>
            );
          })}
          <label className="mt-2 flex min-h-11 items-center gap-3 text-cuerpo font-bold">
            <input
              type="checkbox"
              checked={esCria}
              onChange={(e) => {
                setCria(e.target.checked);
                setResultado(null);
              }}
              className="size-5 accent-tinta"
            />
            Es una cría (cachorro o gatito)
          </label>
        </fieldset>
      </Aparece>

      <Aparece className="flex flex-col gap-4">
        <Boton onClick={() => setResultado(evaluarUrgencia(marcadas, { especie: mascota?.especie ?? "perro", esCria }))}>
          <Siren aria-hidden className="size-5" />
          Ver orientación
        </Boton>
        <div aria-live="polite">
          {resultado && (
            <section ref={bloque} tabIndex={-1} className={cn("rounded-tarjeta border-2 bg-papel p-4 outline-none", TONO[resultado.nivel])}>
              <h2 className="text-titulo font-black">{resultado.titulo}</h2>
              <p className="mt-2 text-cuerpo">{resultado.mensaje}</p>
              {resultado.senales.length > 0 && (
                <ul className="mt-3 list-disc pl-5 text-cuerpo text-suave-texto">
                  {resultado.senales.map((s) => (
                    <li key={s.id}>{s.texto}</li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </Aparece>
    </Escalonado>
  );
}
