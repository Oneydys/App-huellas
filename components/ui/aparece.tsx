import { cn } from "@/lib/cn";

/** Contenedor que revela a sus hijos con un escalonado de 60 ms (CSS: ver `.escalonado` en globals.css). */
export function Escalonado({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("escalonado", className)}>{children}</div>;
}

/** Bloque que aparece al montar. Con `prefers-reduced-motion` solo se funde, sin desplazarse. */
export function Aparece({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("entrada", className)}>{children}</div>;
}
