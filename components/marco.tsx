import { cn } from "@/lib/cn";

/** Marco del teléfono: columna de 440 px sobre el fondo durazno, igual en todas las pantallas. */
export function Marco({
  children,
  className,
  conNav = false,
}: {
  children: React.ReactNode;
  className?: string;
  conNav?: boolean;
}) {
  return (
    <main
      className={cn(
        "marco-app mx-auto flex min-h-dvh w-full max-w-md flex-col bg-papel px-6 pt-6 shadow-marco sm:my-6 sm:min-h-190 sm:rounded-tarjeta",
        conNav ? "pb-32" : "pb-8",
        className,
      )}
    >
      {children}
    </main>
  );
}
