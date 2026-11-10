import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis mascotas" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
