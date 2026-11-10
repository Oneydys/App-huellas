import { Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/** Aviso en línea: información neutra o advertencia. Siempre texto legible, nunca solo color. */
export function Aviso({
  tono = "info",
  className,
  children,
}: {
  tono?: "info" | "aviso";
  className?: string;
  children: React.ReactNode;
}) {
  const Icono = tono === "aviso" ? TriangleAlert : Info;
  return (
    <p
      className={cn(
        "flex items-start gap-3 rounded-control bg-hundido p-3 text-cuerpo text-suave-texto",
        tono === "aviso" && "text-tinta",
        className,
      )}
    >
      <Icono aria-hidden className={cn("mt-0.5 size-4 shrink-0", tono === "aviso" ? "text-aviso" : "text-suave")} />
      <span>{children}</span>
    </p>
  );
}
