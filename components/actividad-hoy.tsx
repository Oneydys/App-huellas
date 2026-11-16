"use client";

import { ChevronRight, Footprints } from "lucide-react";
import Link from "next/link";
import { actividadDelDia, progresoObjetivo } from "@/lib/actividad";
import type { FechaISO } from "@/lib/fechas";
import { objetivoDe, type Mascota } from "@/lib/mascota";
import type { Registro } from "@/lib/registros";
import { MascotaAvatar } from "@/components/ui/mascota-avatar";

/**
 * Tarjeta «Actividad de hoy» de Inicio. Toda la tarjeta lleva a la sección Actividad diaria.
 * Sin registros de hoy no muestra cifras: invita a registrar la primera actividad.
 */
export function ActividadHoy({ mascota, registros, hoy }: { mascota: Mascota; registros: readonly Registro[]; hoy: FechaISO }) {
  const resumen = actividadDelDia(registros, mascota.id, hoy);
  const objetivo = objetivoDe(mascota);
  const progreso = progresoObjetivo(resumen.minutos, objetivo);
  const vacio = resumen.cantidad === 0;

  return (
    <Link
      href="/app/actividad"
      aria-label={`Actividad de hoy de ${mascota.nombre}. Abrir actividad diaria`}
      className="block overflow-hidden rounded-tarjeta bg-papel shadow-calida ring-1 ring-linea transition-transform duration-[120ms] active:scale-[0.98]"
    >
      <div className="flex items-center gap-3 bg-turquesa/25 px-4 py-3">
        <MascotaAvatar personaje={mascota.personaje} foto={mascota.foto} tamano={56} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-etiqueta font-black tracking-wider text-suave-texto">ACTIVIDAD DE HOY</p>
          <p className="truncate text-titulo font-black">{mascota.nombre}</p>
        </div>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-tinta" />
      </div>

      {vacio ? (
        <div className="flex flex-col gap-3 p-4">
          <p className="text-titulo font-black">¡Comienza una nueva aventura!</p>
          <p className="text-cuerpo text-suave-texto">Todavía no has registrado actividades de esta mascota.</p>
          <span className="inline-flex min-h-12 items-center justify-center rounded-control bg-naranja px-6 text-boton font-black text-tinta shadow-boton">
            Registrar primera actividad
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-end justify-between gap-3">
            <p className="text-display font-black tabular-nums">
              {resumen.minutos} <span className="text-cuerpo font-extrabold text-suave-texto">min</span>
            </p>
            <div className="flex flex-col items-end gap-1 text-right">
              <span className="inline-flex items-center gap-1 rounded-chip bg-hundido px-3 py-1 text-etiqueta font-extrabold">
                <Footprints aria-hidden className="size-3.5" />
                {resumen.cantidad} {resumen.cantidad === 1 ? "actividad" : "actividades"}
              </span>
              {resumen.distanciaKm !== undefined && (
                <span className="text-etiqueta font-extrabold text-suave-texto">{resumen.distanciaKm.toLocaleString("es", { maximumFractionDigits: 2 })} km</span>
              )}
            </div>
          </div>
          <div>
            <div
              role="progressbar"
              aria-label={`Progreso del objetivo diario de ${objetivo} minutos`}
              aria-valuemin={0}
              aria-valuemax={objetivo}
              aria-valuenow={Math.min(resumen.minutos, objetivo)}
              className="h-3 w-full overflow-hidden rounded-full bg-hundido"
            >
              <div className="h-full rounded-full bg-turquesa transition-[width] duration-300 ease-huellas" style={{ width: `${Math.round(progreso * 100)}%` }} />
            </div>
            <p className="mt-2 text-etiqueta font-extrabold text-suave-texto">
              Objetivo de referencia: {objetivo} min
            </p>
          </div>
          <p className="flex items-center justify-between border-t border-linea pt-3 text-cuerpo font-black">
            Ver historial de actividades
            <ChevronRight aria-hidden className="size-5" />
          </p>
        </div>
      )}
    </Link>
  );
}
