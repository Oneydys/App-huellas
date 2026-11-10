import type { Metadata } from "next";
import { CapaApp } from "@/components/capa-app";

// Las pantallas de /app no se indexan: son el carnet privado de cada persona.
// La plantilla solo llega a los hijos directos. Por eso las rutas de tercer nivel (p. ej.
// /app/carnet/perdida) usan `absolute` en su propio layout.
export const metadata: Metadata = {
  title: { default: "Inicio", template: "%s · Huellas" },
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <CapaApp>{children}</CapaApp>;
}
