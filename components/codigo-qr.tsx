"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { baseDeEnlaces, COLORES_QR, datosIdentificacionSchema, urlEncontrada, type DatosIdentificacion } from "@/lib/qr";

/**
 * QR de identificación: el código lleva a /encontrada/<código> con el nombre, el personaje y la raza.
 * Se genera en el navegador (sin servicios externos). Los colores son los de la marca: tinta sobre papel.
 */
export function CodigoQr({
  codigo,
  datos,
  etiqueta,
  className,
}: {
  codigo: string;
  datos: DatosIdentificacion;
  etiqueta: string;
  className?: string;
}) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  // Clave estable: el objeto `datos` se crea en cada render del padre y no debe relanzar el QR.
  const clave = JSON.stringify(datos);
  const valido = datosIdentificacionSchema.safeParse(datos).success;

  useEffect(() => {
    let cancelado = false;
    const datosValidos = datosIdentificacionSchema.safeParse(JSON.parse(clave));
    if (!datosValidos.success) return;
    const url = urlEncontrada(baseDeEnlaces(window.location.origin), codigo, datosValidos.data);
    import("qrcode")
      .then((qr) => qr.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: COLORES_QR.oscuro, light: COLORES_QR.claro } }))
      .then((texto) => !cancelado && setSvg(texto))
      .catch(() => !cancelado && setError(true));
    return () => {
      cancelado = true;
    };
  }, [codigo, clave]);

  if (!valido || error) return <p role="alert" className="text-cuerpo font-bold text-error">No pudimos crear el código QR.</p>;
  return svg ? (
    <div
      role="img"
      aria-label={etiqueta}
      className={cn("[&>svg]:size-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  ) : (
    <div role="status" aria-label="Creando el código QR" className={cn("esqueleto", className)} />
  );
}
