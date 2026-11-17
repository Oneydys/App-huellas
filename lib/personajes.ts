// Fotos de mascotas de Peluvet con fondo transparente (public/images/personajes/photo-*.webp).
// Los IDs no cambian: los QR y los carnets guardados dependen de ellos. Solo cambian el nombre, el dije y la imagen que se ven.
// Los personajes 3D anteriores (tabby, longhair, beagle, husky) se conservan en la misma carpeta como respaldo.
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
    nombre: "Gato mestizo",
    imagen: "/images/personajes/photo-europeo.webp",
    dije: "Huella turquesa",
    alt: "Gato gris y blanco con collar turquesa y dije de huella turquesa",
    nombreSugerido: "Luna",
  },
  {
    id: "persa",
    especie: "gato",
    nombre: "Gato Maine Coon",
    imagen: "/images/personajes/photo-persa.webp",
    dije: "Luna morada con dorado",
    alt: "Gato Maine Coon con collar morado y dije de luna morada y dorada",
    nombreSugerido: "Nala",
  },
  {
    id: "beagle",
    especie: "perro",
    nombre: "Perro beagle",
    imagen: "/images/personajes/photo-beagle.webp",
    dije: "Huellita plateada",
    alt: "Perro beagle con collar rojo y dije de huellita plateada",
    nombreSugerido: "Max",
  },
  {
    id: "husky",
    especie: "perro",
    nombre: "Perro Shih Tzu",
    imagen: "/images/personajes/photo-shihtzu.webp",
    dije: "Huesito con huellita dorado",
    alt: "Perro Shih Tzu con lazo rosa y dije dorado de hueso con huellita",
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
