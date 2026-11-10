"use client";

import { Siren } from "lucide-react";
import Link from "next/link";
import { CuidadoDestacado } from "@/components/cuidado";
import { IconoTipo } from "@/components/iconos";
import { useRegistroRapido } from "@/components/registro-rapido";
import { SelectorMascota } from "@/components/selector-mascota";
import { SinMascota } from "@/components/sin-mascota";
import { TarjetaCarnet } from "@/components/tarjeta-carnet";
import { TarjetaHuella } from "@/components/tarjeta-huella";
import { Aviso } from "@/components/ui/aviso";
import { Aparece, Escalonado } from "@/components/ui/aparece";
import { Boton, BotonLink } from "@/components/ui/boton";
import { Chip } from "@/components/ui/chip";
import { Logotipo } from "@/components/ui/mascota-avatar";
import { useHechoHoy } from "@/components/use-hecho-hoy";
import { estadoDeCategoria, estadoDelMes, ETIQUETA_ESTADO_CATEGORIA, type EstadoCategoria } from "@/lib/calendario-vivo";
import { diasEntre, describirDias, formatearFecha } from "@/lib/fechas";
import { PLANTILLA } from "@/lib/plantilla";
import { ETIQUETA_TIPO } from "@/lib/registros";
import { useVistaMascota } from "@/lib/store/vistas";

const CATEGORIAS = ["vacuna", "desparasitacion", "peso", "visita"] as const;
const TONO: Record<EstadoCategoria, "exito" | "naranja" | "aviso" | "neutro"> = {
  "al-dia": "exito",
  proximo: "naranja",
  pasada: "aviso",
  "sin-registro": "neutro",
};
const CORTO: Record<EstadoCategoria, string> = {
  "al-dia": "Sin fechas pasadas",
  proximo: "Próximo",
  pasada: "Pasó la fecha",
  "sin-registro": "Sin registro",
};

export default function Inicio() {
  const { mascota, hoy, registros, calendario, destacado } = useVistaMascota();
  const { abrir } = useRegistroRapido();
  const hechoHoy = useHechoHoy();
  if (!mascota || !calendario) return <SinMascota />;

  const mes = estadoDelMes(calendario.propuestas, registros, mascota.id, hoy);
  const categorias = CATEGORIAS.map((c) => estadoDeCategoria(c, registros, calendario.propuestas, mascota.id));
  const sePuedeHacerYa = destacado && destacado.categoria !== "peso" && destacado.categoria !== "medicamento";

  return (
    <Escalonado className="flex flex-col gap-6">
      <Aparece className="flex flex-col gap-4">
        <Logotipo />
        <SelectorMascota />
      </Aparece>

      <Aparece>
        <TarjetaCarnet mascota={mascota} hoy={hoy} />
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <h2 className="text-titulo font-black">Próximo cuidado de {mascota.nombre}</h2>
        {destacado ? (
          <CuidadoDestacado propuesta={destacado}>
            <div className="mt-4 flex flex-col gap-2">
              {sePuedeHacerYa ? (
                <Boton onClick={() => hechoHoy(destacado)}>Hecho hoy</Boton>
              ) : destacado.categoria === "peso" ? (
                <Boton onClick={() => abrir({ tipo: "peso" })}>Anotar su peso</Boton>
              ) : null}
              <BotonLink href="/app/calendario" variante="secundario" className="bg-papel">
                Ver el calendario
              </BotonLink>
            </div>
          </CuidadoDestacado>
        ) : (
          <Aviso>Agrega un registro y el Calendario Vivo propondrá lo que sigue.</Aviso>
        )}
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <h2 className="text-titulo font-black">Este mes</h2>
        <dl className="grid grid-cols-3 gap-3 text-center">
          {[
            { n: mes.paraEsteMes, t: "por hacer" },
            { n: mes.hechosEsteMes, t: "hechos" },
            { n: mes.pasaronFecha, t: "con fecha pasada" },
          ].map(({ n, t }) => (
            <div key={t} className="rounded-tarjeta bg-hundido px-2 py-3">
              <dt className="sr-only">{t}</dt>
              <dd className="text-display font-black tabular-nums">{n}</dd>
              <dd className="text-etiqueta font-bold text-suave-texto" aria-hidden>
                {t}
              </dd>
            </div>
          ))}
        </dl>
        {/* Con dos columnas, «Desparasitación» solo cabe a partir de 430 px: por debajo, el icono va sobre la etiqueta y en 320 px es una columna. */}
        <ul className="grid grid-cols-1 gap-3 min-[375px]:grid-cols-2">
          {categorias.map((c) => (
            <li key={c.categoria}>
              <Link
                href={c.categoria === "peso" || c.categoria === "vacuna" ? "/app/carnet" : "/app/calendario"}
                aria-label={`${ETIQUETA_TIPO[c.categoria]}: ${ETIQUETA_ESTADO_CATEGORIA[c.estado]}${c.ultimo ? `, último registro ${formatearFecha(c.ultimo.fecha)}` : ""}`}
                className="flex h-full min-h-28 flex-col gap-2 rounded-tarjeta bg-papel p-3 shadow-calida transition-transform duration-[120ms] active:scale-[0.98] min-[430px]:p-4"
              >
                <span className="flex flex-col items-start gap-1 text-cuerpo font-black min-[430px]:flex-row min-[430px]:items-center min-[430px]:gap-2">
                  <IconoTipo tipo={c.categoria} className="size-4 shrink-0 text-naranja" />
                  {ETIQUETA_TIPO[c.categoria]}
                </span>
                <Chip tono={TONO[c.estado]} className="self-start">
                  {CORTO[c.estado]}
                </Chip>
                <span className="text-cuerpo text-suave-texto">
                  {c.ultimo
                    ? `Último: ${describirDias(diasEntre(hoy, c.ultimo.fecha)).toLowerCase()}${
                        c.proxima && c.estado !== "pasada" ? ` · próximo ${describirDias(diasEntre(hoy, c.proxima.fecha)).toLowerCase()}` : ""
                      }`
                    : "Toca para ver más"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-cuerpo text-suave-texto">
          «Sin fechas pasadas» significa que no hay fechas vencidas según lo que registraste. {PLANTILLA.textos.avisoOrientativo}
        </p>
      </Aparece>

      <Aparece>
        <Link
          href="/app/urgencia"
          className="flex items-center gap-3 rounded-tarjeta bg-hundido p-4 transition-transform duration-[120ms] active:scale-[0.98]"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-control bg-papel text-error">
            <Siren aria-hidden className="size-5" />
          </span>
          <span>
            <span className="block text-cuerpo font-black">¿Algo te preocupa?</span>
            <span className="block text-cuerpo text-suave-texto">Revisa señales de alerta y cuándo llamar a tu veterinario.</span>
          </span>
        </Link>
      </Aparece>

      <Aparece>
        <TarjetaHuella />
      </Aparece>

      <Aparece>
        <p className="text-center text-cuerpo text-suave-texto">{PLANTILLA.textos.avisoNoVeterinario}</p>
      </Aparece>
    </Escalonado>
  );
}
