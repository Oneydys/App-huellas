import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear el carnet",
  description: "Crea el carnet de salud de tu perro o gato: elige su personaje y su nombre. Los datos se guardan en este dispositivo.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
