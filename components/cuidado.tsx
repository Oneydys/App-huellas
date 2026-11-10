import { IconoTipo } from "@/components/iconos";
import { Chip } from "@/components/ui/chip";
import { ETIQUETA_TIPO_FECHA, etiquetaEstado, type PropuestaCuidado } from "@/lib/calendario-vivo";
import { describirDias, formatearFecha } from "@/lib/fechas";
import { PLANTILLA } from "@/lib/plantilla";

export function ChipsCuidado({ propuesta }: { propuesta: PropuestaCuidado }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip
        tono={
          propuesta.estado === "pasada"
            ? "aviso"
            : propuesta.estado === "hoy" || propuesta.estado === "proxima"
              ? "naranja"
              : propuesta.estado === "lejana" && propuesta.tipoFecha !== "programada"
                ? "exito"
                : "neutro"
        }
      >
        {etiquetaEstado(propuesta)}
      </Chip>
      <Chip>{ETIQUETA_TIPO_FECHA[propuesta.tipoFecha]}</Chip>
    </div>
  );
}

/** El cuidado que más importa ahora: se usa en Inicio y en el resultado del onboarding. */
export function CuidadoDestacado({
  propuesta,
  children,
}: {
  propuesta: PropuestaCuidado;
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-label="Próximo cuidado"
      className="rounded-tarjeta bg-hundido p-4 shadow-calida"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-control bg-papel text-naranja">
          <IconoTipo tipo={propuesta.categoria} className="size-6" />
        </span>
        <div className="min-w-0">
          <h3 className="text-titulo font-black">{propuesta.titulo}</h3>
          <p className="mt-1 text-cuerpo font-bold">
            {describirDias(propuesta.diasRestantes)} · {formatearFecha(propuesta.fecha, "corta")}
          </p>
        </div>
      </div>
      {propuesta.detalle && <p className="mt-3 text-cuerpo text-suave-texto">{propuesta.detalle}</p>}
      <div className="mt-3">
        <ChipsCuidado propuesta={propuesta} />
      </div>
      {propuesta.orientativo && (
        <p className="mt-3 text-cuerpo font-bold text-tinta">{PLANTILLA.textos.avisoOrientativo}</p>
      )}
      {children}
    </section>
  );
}
