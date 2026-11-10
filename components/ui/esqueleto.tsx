import { cn } from "@/lib/cn";

export function Esqueleto({ className }: { className?: string }) {
  return <div aria-hidden className={cn("esqueleto rounded-tarjeta", className)} />;
}

/** Pantalla de carga mientras se leen los datos guardados en el dispositivo. */
export function PantallaCargando() {
  return (
    <div role="status" aria-label="Cargando" className="flex flex-col gap-4">
      <Esqueleto className="h-48" />
      <Esqueleto className="h-24" />
      <Esqueleto className="h-24" />
    </div>
  );
}
