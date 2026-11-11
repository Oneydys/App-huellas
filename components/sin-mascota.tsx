"use client";

import { CalendarDays, IdCard, PencilLine } from "lucide-react";
import Image from "next/image";
import { Aparece, Escalonado } from "@/components/ui/aparece";
import { Boton, BotonLink } from "@/components/ui/boton";
import { crearDemo } from "@/lib/demo";
import { useHuellas } from "@/lib/store/hooks";

const PASOS = [
  { icono: IdCard, texto: "Crea su carnet con su nombre y su personaje." },
  { icono: PencilLine, texto: "Anota lo que ya sabes: peso, vacunas, visitas." },
  { icono: CalendarDays, texto: "Mira qué le toca y cuándo, de un vistazo." },
] as const;

/** Estado vacío: el usuario real empieza sin datos y puede crear su mascota o ver la demostración. */
export function SinMascota() {
  const { hoy, despachar } = useHuellas();
  return (
    <Escalonado className="flex flex-1 flex-col gap-6 py-2">
      <Aparece>
        <section className="relative overflow-hidden rounded-tarjeta bg-gradient-to-br from-naranja-claro to-naranja-hondo px-6 pb-6 pt-8 text-center text-tinta shadow-calida">
          <svg aria-hidden viewBox="0 0 120 120" className="pointer-events-none absolute -left-8 top-10 size-32 -rotate-12 fill-papel/20">
            <ellipse cx="60" cy="78" rx="22" ry="18" />
            <ellipse cx="32" cy="52" rx="9" ry="12" />
            <ellipse cx="52" cy="38" rx="9" ry="12" />
            <ellipse cx="74" cy="38" rx="9" ry="12" />
            <ellipse cx="94" cy="52" rx="9" ry="12" />
          </svg>
          <p className="text-etiqueta font-black tracking-wider">AQUÍ VIVIRÁ SU HISTORIA</p>
          <h1 className="mt-2 text-display font-black tracking-tight">Aún no hay ninguna mascota</h1>
          <Image
            src="/images/huellas-mascot.png"
            alt="Cachorro de Peluvet con collar turquesa y dije de huella"
            width={1368}
            height={1149}
            sizes="220px"
            priority
            className="mx-auto mt-4 h-auto w-56 drop-shadow-[0_16px_12px_rgba(154,86,30,0.4)]"
          />
        </section>
      </Aparece>

      <Aparece>
        <ol className="flex flex-col gap-3">
          {PASOS.map(({ icono: Icono, texto }, i) => (
            <li key={texto} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-control bg-hundido text-naranja">
                <Icono aria-hidden className="size-5" />
              </span>
              <p className="text-cuerpo">
                <span className="font-black">{i + 1}. </span>
                {texto}
              </p>
            </li>
          ))}
        </ol>
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <BotonLink href="/app/mascotas/nueva">Crear su carnet</BotonLink>
        <Boton variante="secundario" onClick={() => despachar({ tipo: "demo/cargar", demo: crearDemo(hoy) })}>
          Ver con datos de demostración
        </Boton>
      </Aparece>
    </Escalonado>
  );
}
