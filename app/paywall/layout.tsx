import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes",
  description: "Planes de Peluvet: el plan gratis incluye una mascota. Demostración local: no cobra.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
