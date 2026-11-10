import type { CuidadoProgramado } from "../cuidados";
import type { DatosDemo } from "../demo";
import type { FechaISO } from "../fechas";
import { mascotaSchema, type Mascota } from "../mascota";
import type { Registro } from "../registros";
import { estadoVacio, type EstadoApp, type Plan } from "./estado";

export type CambiosMascota = Partial<
  Pick<
    Mascota,
    "nombre" | "personaje" | "especie" | "nacimiento" | "nacimientoAproximado" | "raza" | "pais" | "prioridad" | "foto" | "contacto"
  >
>;

export type Accion =
  | { tipo: "mascota/agregar"; mascota: Mascota; registros?: Registro[] }
  | { tipo: "mascota/editar"; id: string; cambios: CambiosMascota }
  | { tipo: "mascota/eliminar"; id: string }
  | { tipo: "mascota/activar"; id: string }
  | { tipo: "registro/agregar"; registro: Registro }
  | { tipo: "registro/eliminar"; id: string }
  | { tipo: "cuidado/programar"; cuidado: CuidadoProgramado }
  | { tipo: "cuidado/completar"; id: string; fecha: FechaISO }
  | { tipo: "cuidado/reabrir"; id: string }
  | { tipo: "cuidado/eliminar"; id: string }
  | { tipo: "demo/cargar"; demo: DatosDemo }
  | { tipo: "demo/quitar" }
  | { tipo: "plan/establecer"; plan: Plan; hoy: FechaISO }
  | { tipo: "acceso/iniciar" }
  | { tipo: "estado/reemplazar"; estado: EstadoApp }
  | { tipo: "estado/reiniciar" };

function activaTrasQuitar(mascotas: readonly Mascota[], activaId: string | null): string | null {
  if (activaId && mascotas.some((m) => m.id === activaId)) return activaId;
  return mascotas[0]?.id ?? null;
}

/** Reductor puro: recibe entidades ya validadas y devuelve un estado nuevo. */
export function reducir(estado: EstadoApp, accion: Accion): EstadoApp {
  switch (accion.tipo) {
    case "mascota/agregar": {
      if (estado.mascotas.some((m) => m.id === accion.mascota.id)) return estado;
      return {
        ...estado,
        mascotas: [...estado.mascotas, accion.mascota],
        registros: [...estado.registros, ...(accion.registros ?? [])],
        mascotaActivaId: accion.mascota.id,
      };
    }
    case "mascota/editar": {
      const actual = estado.mascotas.find((m) => m.id === accion.id);
      if (!actual) return estado;
      const candidata = mascotaSchema.safeParse({ ...actual, ...accion.cambios });
      if (!candidata.success) return estado;
      return {
        ...estado,
        mascotas: estado.mascotas.map((m) => (m.id === accion.id ? candidata.data : m)),
      };
    }
    case "mascota/eliminar": {
      const mascotas = estado.mascotas.filter((m) => m.id !== accion.id);
      return {
        ...estado,
        mascotas,
        registros: estado.registros.filter((r) => r.mascotaId !== accion.id),
        cuidados: estado.cuidados.filter((c) => c.mascotaId !== accion.id),
        mascotaActivaId: activaTrasQuitar(mascotas, estado.mascotaActivaId),
      };
    }
    case "mascota/activar":
      return estado.mascotas.some((m) => m.id === accion.id)
        ? { ...estado, mascotaActivaId: accion.id }
        : estado;
    case "registro/agregar":
      if (!estado.mascotas.some((m) => m.id === accion.registro.mascotaId)) return estado;
      if (estado.registros.some((r) => r.id === accion.registro.id)) return estado;
      return { ...estado, registros: [...estado.registros, accion.registro] };
    case "registro/eliminar":
      return { ...estado, registros: estado.registros.filter((r) => r.id !== accion.id) };
    case "cuidado/programar":
      if (!estado.mascotas.some((m) => m.id === accion.cuidado.mascotaId)) return estado;
      return { ...estado, cuidados: [...estado.cuidados, accion.cuidado] };
    case "cuidado/completar":
      return {
        ...estado,
        cuidados: estado.cuidados.map((c) => (c.id === accion.id ? { ...c, completadoEn: accion.fecha } : c)),
      };
    case "cuidado/reabrir":
      return {
        ...estado,
        cuidados: estado.cuidados.map((c) => (c.id === accion.id ? { ...c, completadoEn: undefined } : c)),
      };
    case "cuidado/eliminar":
      return { ...estado, cuidados: estado.cuidados.filter((c) => c.id !== accion.id) };
    case "demo/cargar": {
      const yaCargada = accion.demo.mascotas.every((d) => estado.mascotas.some((m) => m.id === d.id));
      if (yaCargada) return estado;
      const mascotas = [...estado.mascotas, ...accion.demo.mascotas.filter((d) => !estado.mascotas.some((m) => m.id === d.id))];
      return {
        ...estado,
        mascotas,
        registros: [...estado.registros, ...accion.demo.registros.filter((d) => !estado.registros.some((r) => r.id === d.id))],
        cuidados: [...estado.cuidados, ...accion.demo.cuidados.filter((d) => !estado.cuidados.some((c) => c.id === d.id))],
        mascotaActivaId: estado.mascotaActivaId ?? accion.demo.mascotas[0]?.id ?? null,
        accesoSimulado: true,
      };
    }
    case "demo/quitar": {
      const idsDemo = new Set(estado.mascotas.filter((m) => m.origen === "demo").map((m) => m.id));
      const mascotas = estado.mascotas.filter((m) => !idsDemo.has(m.id));
      return {
        ...estado,
        mascotas,
        registros: estado.registros.filter((r) => !idsDemo.has(r.mascotaId) && r.origen !== "demo"),
        cuidados: estado.cuidados.filter((c) => !idsDemo.has(c.mascotaId) && c.origen !== "demo"),
        mascotaActivaId: activaTrasQuitar(mascotas, estado.mascotaActivaId),
      };
    }
    case "plan/establecer":
      return {
        ...estado,
        plan: accion.plan,
        pruebaIniciadaEn: accion.plan === "prueba-simulada" ? accion.hoy : null,
      };
    case "acceso/iniciar":
      return { ...estado, accesoSimulado: true };
    case "estado/reemplazar":
      return accion.estado;
    case "estado/reiniciar":
      return estadoVacio();
  }
}
