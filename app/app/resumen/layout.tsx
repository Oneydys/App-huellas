import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resumen para el veterinario" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
