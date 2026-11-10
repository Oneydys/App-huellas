import type { Metadata } from "next";
import { Encontrada } from "@/components/encontrada";

// Página de contacto para quien encuentra una mascota: no debe indexarse.
export const metadata: Metadata = { title: "Mascota encontrada", robots: { index: false, follow: false } };

export default async function Pagina({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  return <Encontrada codigo={codigo.slice(0, 20)} />;
}
