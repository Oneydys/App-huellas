import type { Metadata } from "next";
import { DocumentoLegalPagina } from "@/components/documento-legal";
import { COOKIES } from "@/lib/legal";

export const metadata: Metadata = {
  title: COOKIES.titulo,
  description: "Qué guarda Peluvet en el navegador de este dispositivo y para qué.",
};

export default function Cookies() {
  return <DocumentoLegalPagina doc={COOKIES} />;
}
