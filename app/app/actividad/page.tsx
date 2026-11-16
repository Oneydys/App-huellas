"use client";

import { Footprints } from "lucide-react";
import { ICONOS_ACTIVIDAD } from "@/components/iconos";
import { SelectorMascota } from "@/components/selector-mascota";
import { SinMascota } from "@/components/sin-mascota";
import { useRegistroRapido } from "@/components/registro-rapido";
import { Aparece, Escalonado } from "@/components/ui/aparece";
import { Boton } from "@/components/ui/boton";
import { Chip } from "@/components/ui/chip";
import { actividadDelDia, historialActividad, progresoObjetivo } from "@/lib/actividad";
import { formatearFecha } from "@/lib/fechas";
import { objetivoDe } from "@/lib/mascota";
import { ETIQUETA_ACTIVIDAD, type RegistroDe, type TipoActividad } from "@/lib/registros";
import { useVistaMascota } from "@/lib/store/vistas";

function TextoMinutos({ minutos, distanciaKm, cantidad }: { minutos: number; distanciaKm?: number; cantidad: number }) {
  return (
    <span className="text-etiqueta font-extrabold text-suave-texto">
      {minutos} min · {cantidad} {cantidad === 1 ? "actividad" : "actividades"}
      {distanciaKm !== undefined && ` · ${distanciaKm.toLocaleString("es", { maximumFractionDigits: 2 })} km`}
    </span>
  );
}

function IconoActividad({ tipo }: { tipo: TipoActividad }) {
  const Icono = ICONOS_ACTIVIDAD[tipo];
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-control bg-turquesa/25 text-tinta">
      <Icono aria-hidden className="size-5" />
    </span>
  );
}

export default function ActividadDiaria() {
  const { mascota, hoy, registros } = useVistaMascota();
  const { abrir } = useRegistroRapido();
  if (!mascota) return <SinMascota />;

  const resumen = actividadDelDia(registros, mascota.id, hoy);
  const objetivo = objetivoDe(mascota);
  const progreso = progresoObjetivo(resumen.minutos, objetivo);
  const historial = historialActividad(registros, mascota.id);
  const deHoy = registros.filter((r): r is RegistroDe<"actividad"> => r.tipo === "actividad" && r.fecha === hoy);
  const sinActividad = historial.length === 0;

  return (
    <Escalonado className="flex flex-col gap-6">
      <Aparece className="flex flex-col gap-4">
        <div>
          <p className="text-etiqueta font-black tracking-wider text-suave-texto">ACTIVIDAD</p>
          <h1 className="text-display font-black tracking-tight">Actividad diaria</h1>
        </div>
        <SelectorMascota />
      </Aparece>

      {sinActividad ? (
        <Aparece className="flex flex-col items-center gap-4 rounded-tarjeta bg-papel p-6 text-center shadow-calida ring-1 ring-linea">
          <span className="grid size-16 place-items-center rounded-full bg-turquesa/25 text-tinta">
            <Footprints aria-hidden className="size-8" />
          </span>
          <h2 className="text-titulo font-black">¡Comienza una nueva aventura!</h2>
          <p className="text-cuerpo text-suave-texto">Todavía no has registrado actividades de esta mascota.</p>
          <Boton className="w-full" onClick={() => abrir({ tipo: "actividad" })}>
            Registrar primera actividad
          </Boton>
        </Aparece>
      ) : (
        <>
          <Aparece className="flex flex-col gap-4 rounded-tarjeta bg-papel p-5 shadow-calida ring-1 ring-linea">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-etiqueta font-black tracking-wider text-suave-texto">HOY</p>
                <p className="text-display font-black tabular-nums">
                  {resumen.minutos} <span className="text-cuerpo font-extrabold text-suave-texto">min</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <Chip tono="turquesa">
                  {resumen.cantidad} {resumen.cantidad === 1 ? "actividad" : "actividades"}
                </Chip>
                {resumen.distanciaKm !== undefined && (
                  <span className="text-etiqueta font-extrabold text-suave-texto">
                    {resumen.distanciaKm.toLocaleString("es", { maximumFractionDigits: 2 })} km de paseo
                  </span>
                )}
              </div>
            </div>
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
            <p className="text-etiqueta font-extrabold text-suave-texto">
              Objetivo de referencia: {objetivo} min. Lo eliges tú en Mascotas: es una referencia configurable, no una recomendación veterinaria ni una obligación.
            </p>
            <Boton variante="turquesa" onClick={() => abrir({ tipo: "actividad" })}>
              Registrar actividad
            </Boton>
          </Aparece>

          <Aparece className="flex flex-col gap-3">
            <h2 className="text-titulo font-black">Hoy</h2>
            {deHoy.length === 0 ? (
              <p className="rounded-tarjeta bg-hundido p-4 text-cuerpo text-suave-texto">Todavía no hay actividades registradas hoy.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {deHoy.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 rounded-tarjeta bg-papel p-4 shadow-calida ring-1 ring-linea">
                    <div className="flex min-w-0 items-center gap-3">
                      <IconoActividad tipo={r.tipoActividad} />
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-cuerpo font-black">
                        {ETIQUETA_ACTIVIDAD[r.tipoActividad]}
                        {r.origen === "demo" && <Chip>DEMO</Chip>}
                      </span>
                      <span className="text-etiqueta font-extrabold text-suave-texto">
                        {r.minutos} min
                        {r.distanciaKm !== undefined && ` · ${r.distanciaKm.toLocaleString("es", { maximumFractionDigits: 2 })} km`}
                      </span>
                    </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Aparece>

          <div id="historial">
          <Aparece className="flex flex-col gap-3">
            <h2 className="text-titulo font-black">Historial de actividades</h2>
            <ul className="flex flex-col gap-2">
              {historial.map((d) => (
                <li key={d.fecha} className="flex items-center justify-between gap-3 rounded-tarjeta bg-papel p-4 shadow-calida ring-1 ring-linea">
                  <span className="text-cuerpo font-black">{formatearFecha(d.fecha, "corta")}</span>
                  <TextoMinutos minutos={d.minutos} distanciaKm={d.distanciaKm} cantidad={d.cantidad} />
                </li>
              ))}
            </ul>
          </Aparece>
          </div>
        </>
      )}
    </Escalonado>
  );
}
