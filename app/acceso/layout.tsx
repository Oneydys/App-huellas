import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entra a tu carnet con tu correo. Demostración local: no envía correos.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
