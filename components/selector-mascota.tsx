"use client";

import { MascotaAvatar } from "@/components/ui/mascota-avatar";
import { cn } from "@/lib/cn";
import { useHuellas } from "@/lib/store/hooks";

/** Cambia de mascota activa. Si solo hay una, no se muestra. */
export function SelectorMascota({ className }: { className?: string }) {
  const { estado, mascota, despachar } = useHuellas();
  if (estado.mascotas.length < 2) return null;
  return (
    <div role="group" aria-label="Mascota" className={cn("-mx-6 sin-barra flex gap-2 overflow-x-auto px-6 pb-1", className)}>
      {estado.mascotas.map((m) => {
        const activa = m.id === mascota?.id;
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={activa}
            onClick={() => despachar({ tipo: "mascota/activar", id: m.id })}
            className={cn(
              "flex min-h-11 shrink-0 items-center gap-2 rounded-control border-2 bg-papel py-1 pl-1 pr-4 text-cuerpo font-black transition-[transform,border-color] duration-[120ms] active:scale-[0.97]",
              activa ? "border-naranja bg-hundido" : "border-transparent shadow-calida",
            )}
          >
            <span className="grid size-8 place-items-center overflow-hidden rounded-chip bg-hundido">
              <MascotaAvatar personaje={m.personaje} foto={m.foto} tamano={32} />
            </span>
            {m.nombre}
            {m.origen === "demo" && (
              <span data-captura="oculto" className="text-etiqueta font-black text-suave-texto">
                DEMO
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
