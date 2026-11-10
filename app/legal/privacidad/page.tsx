import type { Metadata } from "next";
import { DocumentoLegalPagina } from "@/components/documento-legal";
import { PRIVACIDAD } from "@/lib/legal";

export const metadata: Metadata = {
  title: PRIVACIDAD.titulo,
  description: "Qué datos guarda Huellas, dónde se quedan y cómo borrarlos.",
};

export default function Privacidad() {
  return <DocumentoLegalPagina doc={PRIVACIDAD} />;
}
