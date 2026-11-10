/** Descarga un archivo generado en el navegador. Exportar nunca depende del plan. */
export function descargarArchivo(nombre: string, contenido: string, tipo = "text/plain;charset=utf-8"): void {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
