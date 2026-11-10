import type { Metadata } from "next";
import { DocumentoLegalPagina } from "@/components/documento-legal";
import { TERMINOS } from "@/lib/legal";

export const metadata: Metadata = {
  title: TERMINOS.titulo,
  description: "Qué hace Huellas y qué no hace: no diagnostica ni reemplaza al veterinario.",
};

export default function Terminos() {
  return <DocumentoLegalPagina doc={TERMINOS} />;
}
