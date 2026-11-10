"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

interface CampoBase {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  className?: string;
}

const ENTRADA =
  "h-14 w-full rounded-control border bg-papel px-4 text-cuerpo text-tinta placeholder:text-suave-texto focus-visible:border-naranja disabled:opacity-50";

export function Campo({
  etiqueta,
  ayuda,
  error,
  className,
  ...resto
}: CampoBase & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">) {
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-cuerpo font-black">
        {etiqueta}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? idAyuda : undefined}
        className={cn(ENTRADA, error ? "border-error border-2" : "border-linea")}
        {...resto}
      />
      {(error || ayuda) && (
        <p
          id={idAyuda}
          role={error ? "alert" : undefined}
          className={cn("mt-2 text-cuerpo", error ? "font-bold text-error" : "text-suave-texto")}
        >
          {error ?? ayuda}
        </p>
      )}
    </div>
  );
}

export function Selector({
  etiqueta,
  ayuda,
  error,
  className,
  children,
  ...resto
}: CampoBase & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className">) {
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-cuerpo font-black">
        {etiqueta}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? idAyuda : undefined}
        className={cn(ENTRADA, error ? "border-error border-2" : "border-linea")}
        {...resto}
      >
        {children}
      </select>
      {(error || ayuda) && (
        <p
          id={idAyuda}
          role={error ? "alert" : undefined}
          className={cn("mt-2 text-cuerpo", error ? "font-bold text-error" : "text-suave-texto")}
        >
          {error ?? ayuda}
        </p>
      )}
    </div>
  );
}

export function AreaTexto({
  etiqueta,
  ayuda,
  error,
  className,
  ...resto
}: CampoBase & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className">) {
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-cuerpo font-black">
        {etiqueta}
      </label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? idAyuda : undefined}
        className={cn(ENTRADA, "h-auto py-3", error ? "border-error border-2" : "border-linea")}
        {...resto}
      />
      {(error || ayuda) && (
        <p
          id={idAyuda}
          role={error ? "alert" : undefined}
          className={cn("mt-2 text-cuerpo", error ? "font-bold text-error" : "text-suave-texto")}
        >
          {error ?? ayuda}
        </p>
      )}
    </div>
  );
}
