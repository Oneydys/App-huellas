import Link from "next/link";
import { Marco } from "@/components/marco";
import { Aviso } from "@/components/ui/aviso";
import { Logotipo } from "@/components/ui/mascota-avatar";
import { type DocumentoLegal, LEGAL } from "@/lib/legal";
import { avisosDePlantilla } from "@/lib/plantilla";

export function DocumentoLegalPagina({ doc }: { doc: DocumentoLegal }) {
  return (
    <Marco>
      <header className="flex items-center justify-between gap-3">
        <Logotipo />
        <Link href="/" className="inline-flex min-h-11 items-center text-cuerpo font-black text-suave-texto">
          Volver al inicio
        </Link>
      </header>

      <article className="mt-6 flex flex-col gap-6">
        <div>
          <h1 className="text-display font-black tracking-tight">{doc.titulo}</h1>
          <p className="mt-2 text-cuerpo text-suave-texto">{doc.resumen}</p>
          <p className="mt-2 text-cuerpo text-suave-texto">Última actualización: {LEGAL.actualizado}</p>
        </div>

        {avisosDePlantilla && (
          <Aviso>
            Texto de plantilla: antes de publicarlo, reemplaza los datos marcados [COMPLETAR] y revísalo con tu asesor legal.
          </Aviso>
        )}

        {doc.secciones.map((s, i) => (
          <section key={s.titulo} aria-labelledby={`legal-${i}`}>
            <h2 id={`legal-${i}`} className="text-titulo font-black">
              {s.titulo}
            </h2>
            {s.parrafos.map((p) => (
              <p key={p} className="mt-2 text-cuerpo">
                {p}
              </p>
            ))}
            {s.lista && (
              <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-cuerpo">
                {s.lista.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </Marco>
  );
}
