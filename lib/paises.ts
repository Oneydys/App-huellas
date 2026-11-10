// Países hispanohablantes disponibles para elegir. Elegir un país NO activa calendarios
// sanitarios: eso depende de `lib/calendarios-pais.ts` (ver ese archivo).
export const PAISES = [
  { codigo: "AR", nombre: "Argentina" },
  { codigo: "BO", nombre: "Bolivia" },
  { codigo: "CL", nombre: "Chile" },
  { codigo: "CO", nombre: "Colombia" },
  { codigo: "CR", nombre: "Costa Rica" },
  { codigo: "CU", nombre: "Cuba" },
  { codigo: "EC", nombre: "Ecuador" },
  { codigo: "SV", nombre: "El Salvador" },
  { codigo: "ES", nombre: "España" },
  { codigo: "GT", nombre: "Guatemala" },
  { codigo: "HN", nombre: "Honduras" },
  { codigo: "MX", nombre: "México" },
  { codigo: "NI", nombre: "Nicaragua" },
  { codigo: "PA", nombre: "Panamá" },
  { codigo: "PY", nombre: "Paraguay" },
  { codigo: "PE", nombre: "Perú" },
  { codigo: "PR", nombre: "Puerto Rico" },
  { codigo: "DO", nombre: "República Dominicana" },
  { codigo: "UY", nombre: "Uruguay" },
  { codigo: "VE", nombre: "Venezuela" },
  { codigo: "OTRO", nombre: "Otro país" },
] as const;

export type CodigoPais = (typeof PAISES)[number]["codigo"];

export const CODIGOS_PAIS = PAISES.map((p) => p.codigo) as [CodigoPais, ...CodigoPais[]];

export function nombreDePais(codigo: CodigoPais): string {
  return PAISES.find((p) => p.codigo === codigo)?.nombre ?? "Otro país";
}
