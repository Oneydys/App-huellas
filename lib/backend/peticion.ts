/**
 * Protección contra peticiones de otros sitios (CSRF) para las rutas que cambian el acceso.
 * Dos reglas: el cuerpo debe ser JSON y el encabezado Origin debe ser el de esta misma app.
 */

export function esJson(request: Request): boolean {
  const tipo = (request.headers.get("content-type") ?? "").toLowerCase();
  return tipo.startsWith("application/json");
}

/**
 * true solo si el navegador dice que la petición viene de este mismo sitio: el encabezado Origin
 * debe tener el mismo dominio (Host) con el que el navegador llamó a la app.
 */
export function origenPermitido(request: Request): boolean {
  const origen = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origen || !host) return false;
  try {
    return new URL(origen).host === host;
  } catch {
    return false;
  }
}

export function peticionPermitida(request: Request, { exigirJson }: { exigirJson: boolean }): boolean {
  if (!origenPermitido(request)) return false;
  return exigirJson ? esJson(request) : true;
}
