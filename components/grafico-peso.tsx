import { formatearFecha } from "@/lib/fechas";
import { formatearKg, type RegistroDe } from "@/lib/registros";

/** Línea simple de peso. Describe los datos con palabras y no interpreta si el cambio es bueno o malo. */
export function GraficoPeso({ pesos }: { pesos: RegistroDe<"peso">[] }) {
  if (pesos.length < 2) return null;
  const ancho = 280;
  const alto = 72;
  const margen = 8;
  const kgs = pesos.map((p) => p.kg);
  const min = Math.min(...kgs);
  const max = Math.max(...kgs);
  const rango = max - min || 1;
  const puntos = pesos.map((p, i) => ({
    x: margen + (i / (pesos.length - 1)) * (ancho - margen * 2),
    y: margen + (1 - (p.kg - min) / rango) * (alto - margen * 2),
  }));
  const primero = pesos[0];
  const ultimo = pesos[pesos.length - 1];
  const resumen = `Peso registrado: de ${formatearKg(primero.kg)} el ${formatearFecha(primero.fecha, "corta")} a ${formatearKg(ultimo.kg)} el ${formatearFecha(ultimo.fecha, "corta")}.`;
  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label={resumen} className="h-auto w-full">
        <polyline
          points={puntos.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="var(--color-tinta)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {puntos.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5" fill="var(--color-naranja)" stroke="var(--color-tinta)" strokeWidth="2" />
        ))}
      </svg>
      <figcaption className="mt-1 text-cuerpo text-suave-texto">{resumen}</figcaption>
    </figure>
  );
}
