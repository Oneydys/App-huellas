import { describe, expect, it } from "vitest";
import { actividadDelDia, historialActividad, progresoObjetivo } from "./actividad";
import { crearDemo } from "./demo";
import { objetivoDe, OBJETIVO_ACTIVIDAD_INICIAL } from "./mascota";
import { ACTIVIDADES_POR_ESPECIE, actividadesPara, admiteDistancia, crearRegistro, type Registro } from "./registros";

const HOY = "2026-11-10";
const AYER = "2026-11-09";
const ANTEAYER = "2026-11-08";

function actividad(datos: Record<string, unknown>): Registro {
  const r = crearRegistro(
    { origen: "usuario", tipo: "actividad", mascotaId: "m1", fecha: HOY, ...datos },
    { id: String(datos.id ?? Math.random()), hoy: HOY },
  );
  if (!r.ok) throw new Error(JSON.stringify(r.errores));
  return r.registro;
}

describe("registro de actividad", () => {
  it("acepta paseo, juego y ejercicio con minutos", () => {
    for (const tipoActividad of ["paseo", "juego", "ejercicio"]) {
      const r = crearRegistro(
        { origen: "usuario", tipo: "actividad", mascotaId: "m1", fecha: HOY, tipoActividad, minutos: 20 },
        { id: "a", hoy: HOY },
      );
      expect(r.ok).toBe(true);
    }
  });

  it("acepta distancia solo en un paseo", () => {
    const r = crearRegistro(
      { origen: "usuario", tipo: "actividad", mascotaId: "m1", fecha: HOY, tipoActividad: "paseo", minutos: 30, distanciaKm: 2.4 },
      { id: "a", hoy: HOY },
    );
    expect(r.ok).toBe(true);
  });

  it("rechaza la distancia en un juego o un ejercicio", () => {
    for (const tipoActividad of ["juego", "ejercicio"]) {
      const r = crearRegistro(
        { origen: "usuario", tipo: "actividad", mascotaId: "m1", fecha: HOY, tipoActividad, minutos: 20, distanciaKm: 1 },
        { id: "a", hoy: HOY },
      );
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errores.distanciaKm).toBe("La distancia solo se registra en los paseos.");
    }
  });

  it("exige minutos enteros entre 1 y 600", () => {
    const base = { origen: "usuario", tipo: "actividad", mascotaId: "m1", fecha: HOY, tipoActividad: "juego" };
    for (const minutos of [0, -5, 2.5, 601]) {
      const r = crearRegistro({ ...base, minutos }, { id: "a", hoy: HOY });
      expect(r.ok).toBe(false);
    }
  });

  it("exige el tipo de actividad", () => {
    const r = crearRegistro({ origen: "usuario", tipo: "actividad", mascotaId: "m1", fecha: HOY, minutos: 10 }, { id: "a", hoy: HOY });
    expect(r.ok).toBe(false);
  });
});

describe("actividad del día", () => {
  const registros: Registro[] = [
    actividad({ id: "1", tipoActividad: "paseo", minutos: 30, distanciaKm: 2.1 }),
    actividad({ id: "2", tipoActividad: "paseo", minutos: 20, distanciaKm: 0.9 }),
    actividad({ id: "3", tipoActividad: "juego", minutos: 15 }),
    actividad({ id: "4", tipoActividad: "paseo", minutos: 25, fecha: AYER }),
    actividad({ id: "5", tipoActividad: "paseo", minutos: 50, mascotaId: "otra", distanciaKm: 9 }),
  ];

  it("suma minutos y cuenta las actividades solo del día y la mascota", () => {
    const d = actividadDelDia(registros, "m1", HOY);
    expect(d.minutos).toBe(65);
    expect(d.cantidad).toBe(3);
    expect(d.porTipo).toMatchObject({ paseo: 50, juego: 15, ejercicio: 0 });
  });

  it("suma la distancia de los paseos del día", () => {
    expect(actividadDelDia(registros, "m1", HOY).distanciaKm).toBe(3);
  });

  it("no muestra distancia si ningún paseo del día la tiene", () => {
    const d = actividadDelDia([actividad({ id: "9", tipoActividad: "juego", minutos: 10 })], "m1", HOY);
    expect(d.distanciaKm).toBeUndefined();
  });

  it("un día sin actividad devuelve cero, sin inventar datos", () => {
    const d = actividadDelDia(registros, "m1", "2026-01-01");
    expect(d).toMatchObject({ minutos: 0, cantidad: 0 });
    expect(d.distanciaKm).toBeUndefined();
  });
});

describe("progreso hacia el objetivo", () => {
  it("es proporcional y nunca pasa del 100 %", () => {
    expect(progresoObjetivo(15, 30)).toBe(0.5);
    expect(progresoObjetivo(45, 30)).toBe(1);
    expect(progresoObjetivo(0, 30)).toBe(0);
  });

  it("sin objetivo válido no hay progreso", () => {
    expect(progresoObjetivo(20, 0)).toBe(0);
  });
});

describe("historial de actividad", () => {
  it("agrupa por día, del más reciente al más antiguo, y solo de esa mascota", () => {
    const registros: Registro[] = [
      actividad({ id: "1", tipoActividad: "paseo", minutos: 10, fecha: ANTEAYER }),
      actividad({ id: "2", tipoActividad: "juego", minutos: 5, fecha: HOY }),
      actividad({ id: "3", tipoActividad: "paseo", minutos: 20, fecha: HOY }),
      actividad({ id: "4", tipoActividad: "paseo", minutos: 30, fecha: AYER, mascotaId: "otra" }),
    ];
    const historial = historialActividad(registros, "m1");
    expect(historial.map((d) => d.fecha)).toEqual([HOY, ANTEAYER]);
    expect(historial[0]?.minutos).toBe(25);
    expect(historial[0]?.cantidad).toBe(2);
  });
});

describe("objetivo diario", () => {
  it("usa 30 minutos como referencia inicial si la mascota no tiene objetivo", () => {
    expect(OBJETIVO_ACTIVIDAD_INICIAL).toBe(30);
    expect(objetivoDe({})).toBe(30);
  });

  it("usa el objetivo propio de la mascota cuando lo tiene", () => {
    expect(objetivoDe({ objetivoMinutos: 45 })).toBe(45);
  });
});

describe("datos de demostración de actividad", () => {
  it("son de demostración, con id propio, y no se mezclan con los reales", () => {
    const demo = crearDemo(HOY).registros.filter((r) => r.tipo === "actividad");
    expect(demo.length).toBeGreaterThan(0);
    for (const r of demo) {
      expect(r.origen).toBe("demo");
      expect(r.id.startsWith("demo-")).toBe(true);
    }
  });
});

describe("actividades por especie", () => {
  it("perros: paseos, juegos y ejercicio", () => {
    expect(actividadesPara("perro")).toEqual(["paseo", "juego", "ejercicio"]);
  });

  it("gatos: juego y exploración en casa, y paseo con arnés como opción", () => {
    expect(actividadesPara("gato")).toEqual(["juego-casa", "exploracion-casa", "paseo-arnes"]);
    expect(ACTIVIDADES_POR_ESPECIE.gato).not.toContain("paseo");
  });

  it("la distancia solo corresponde a paseos", () => {
    expect(admiteDistancia("paseo")).toBe(true);
    expect(admiteDistancia("paseo-arnes")).toBe(true);
    for (const t of ["juego", "ejercicio", "juego-casa", "exploracion-casa"] as const) {
      expect(admiteDistancia(t)).toBe(false);
    }
  });

  it("rechaza un paseo normal para un gato", () => {
    const r = crearRegistro(
      { origen: "usuario", tipo: "actividad", mascotaId: "m1", fecha: HOY, tipoActividad: "paseo", minutos: 20 },
      { id: "a", hoy: HOY, especie: "gato" },
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores.tipoActividad).toBe("Esa actividad no corresponde a un gato.");
  });

  it("rechaza el juego en casa para un perro", () => {
    const r = crearRegistro(
      { origen: "usuario", tipo: "actividad", mascotaId: "m1", fecha: HOY, tipoActividad: "juego-casa", minutos: 20 },
      { id: "a", hoy: HOY, especie: "perro" },
    );
    expect(r.ok).toBe(false);
  });

  it("acepta el paseo con arnés con distancia para un gato, porque es voluntario", () => {
    const r = crearRegistro(
      { origen: "usuario", tipo: "actividad", mascotaId: "m1", fecha: HOY, tipoActividad: "paseo-arnes", minutos: 15, distanciaKm: 0.5 },
      { id: "a", hoy: HOY, especie: "gato" },
    );
    expect(r.ok).toBe(true);
  });

  it("un gato puede sumar varias sesiones cortas de juego en casa", () => {
    const registros: Registro[] = [
      actividad({ id: "s1", tipoActividad: "juego-casa", minutos: 5 }),
      actividad({ id: "s2", tipoActividad: "exploracion-casa", minutos: 7 }),
      actividad({ id: "s3", tipoActividad: "juego-casa", minutos: 4 }),
    ];
    const d = actividadDelDia(registros, "m1", HOY);
    expect(d.minutos).toBe(16);
    expect(d.cantidad).toBe(3);
    expect(d.distanciaKm).toBeUndefined();
  });
});
