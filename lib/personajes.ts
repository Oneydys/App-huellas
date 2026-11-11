// Personajes 3D originales de Peluvet. Cada uno trae su propio collar y dije.
export type Especie = "perro" | "gato";

export const IDS_PERSONAJE = ["europeo", "persa", "beagle", "husky"] as const;
export type IdPersonaje = (typeof IDS_PERSONAJE)[number];

export interface Personaje {
  id: IdPersonaje;
  especie: Especie;
  nombre: string;
  imagen: string;
  dije: string;
  alt: string;
  nombreSugerido: string;
}

export const PERSONAJES: readonly Personaje[] = [
  {
    id: "europeo",
    especie: "gato",
    nombre: "Gato europeo",
    imagen: "/images/personajes/tabby.webp",
    dije: "Corazón turquesa",
    alt: "Gato europeo naranja con collar y dije de corazón turquesa",
    nombreSugerido: "Luna",
  },
  {
    id: "persa",
    especie: "gato",
    nombre: "Gato persa",
    imagen: "/images/personajes/longhair.webp",
    dije: "Luna violeta",
    alt: "Gato gris y blanco de pelo largo con collar violeta y dije de luna",
    nombreSugerido: "Nala",
  },
  {
    id: "beagle",
    especie: "perro",
    nombre: "Perro beagle",
    imagen: "/images/personajes/beagle.webp",
    dije: "Huella amarilla",
    alt: "Perro beagle con collar y dije de huella amarilla",
    nombreSugerido: "Max",
  },
  {
    id: "husky",
    especie: "perro",
    nombre: "Perro husky",
    imagen: "/images/personajes/husky.webp",
    dije: "Estrella coral",
    alt: "Perro husky gris y blanco con collar coral y dije de estrella",
    nombreSugerido: "Rocky",
  },
];

export function personajePorId(id: IdPersonaje): Personaje {
  const p = PERSONAJES.find((x) => x.id === id);
  if (!p) throw new Error(`Personaje desconocido: ${id}`);
  return p;
}

export function personajesDe(especie: Especie): Personaje[] {
  return PERSONAJES.filter((p) => p.especie === especie);
}

export const ETIQUETA_ESPECIE: Record<Especie, string> = { perro: "Perro", gato: "Gato" };
