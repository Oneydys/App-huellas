import type { Metadata } from "next";

// Ruta de tercer nivel: usa el título completo (la plantilla solo llega a los hijos directos).
export const metadata: Metadata = { title: { absolute: "Tarjeta de mascota perdida · Peluvet" } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
