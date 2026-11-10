import { describe, expect, it } from "vitest";
import { crearCuidado } from "../cuidados";
import { crearDemo } from "../demo";
import { crearMascota, type Mascota } from "../mascota";
import { crearRegistro } from "../registros";
import { estadoVacio, type EstadoApp } from "./estado";
import { reducir } from "./reductor";
import { hayDatosDemo, mascotaActiva, puedeAgregarMascota } from "./selectores";

const HOY = "2026-10-10";

function nueva(id: string, nombre: string): Mascota {
  const r = crearMascota(
    { nombre, especie: "perro", personaje: "husky", nacimiento: "2024-01-01", nacimientoAproximado: false, raza: "", pais: "MX", prioridad: "peso" },
    { id, hoy: HOY },
  );
  if (!r.ok) throw new Error("mascota inválida");
  return r.mascota;
}

function peso(id: string, mascotaId: string, kg: number) {
  const r = crearRegistro({ mascotaId, tipo: "peso", fecha: HOY, kg }, { id, hoy: HOY });
  if (!r.ok) throw new Error("registro inválido");
  return r.registro;
}

describe("store: reductor", () => {
  it("el usuario real empieza vacío", () => {
    const e = estadoVacio();
    expect(e.mascotas).toEqual([]);
    expect(e.registros).toEqual([]);
    expect(hayDatosDemo(e)).toBe(false);
    expect(mascotaActiva(e)).toBeUndefined();
  });

  it("agrega varias mascotas y la última queda activa", () => {
    let e = reducir(estadoVacio(), { tipo: "mascota/agregar", mascota: nueva("a", "Rocky"), registros: [peso("p1", "a", 20)] });
    e = reducir(e, { tipo: "mascota/agregar", mascota: nueva("b", "Max") });
    expect(e.mascotas.map((m) => m.nombre)).toEqual(["Rocky", "Max"]);
    expect(mascotaActiva(e)?.id).toBe("b");
    e = reducir(e, { tipo: "mascota/activar", id: "a" });
    expect(mascotaActiva(e)?.nombre).toBe("Rocky");
    expect(reducir(e, { tipo: "mascota/activar", id: "no-existe" })).toBe(e);
  });

  it("no duplica una mascota con el mismo id", () => {
    const e = reducir(estadoVacio(), { tipo: "mascota/agregar", mascota: nueva("a", "Rocky") });
    expect(reducir(e, { tipo: "mascota/agregar", mascota: nueva("a", "Otra") })).toBe(e);
  });

  it("guarda foto y contacto sin perder el resto de los datos", () => {
    const e = reducir(estadoVacio(), { tipo: "mascota/agregar", mascota: nueva("a", "Rocky"), registros: [peso("p1", "a", 20)] });
    const foto = "data:image/webp;base64,UklGRg==";
    const con = reducir(e, {
      tipo: "mascota/editar",
      id: "a",
      cambios: { foto, contacto: { nombre: "Ana", telefono: "3000000000", nota: "Es sociable" } },
    });
    expect(con.mascotas[0]).toMatchObject({ nombre: "Rocky", foto, contacto: { telefono: "3000000000" } });
    expect(con.registros).toHaveLength(1);
    const sin = reducir(con, { tipo: "mascota/editar", id: "a", cambios: { foto: undefined } });
    expect(sin.mascotas[0].foto).toBeUndefined();
    expect(sin.mascotas[0].contacto?.nombre).toBe("Ana");
  });

  it("edita validando: un cambio inválido se ignora", () => {
    const e = reducir(estadoVacio(), { tipo: "mascota/agregar", mascota: nueva("a", "Rocky") });
    const bien = reducir(e, { tipo: "mascota/editar", id: "a", cambios: { nombre: "Rocco", raza: "Husky" } });
    expect(bien.mascotas[0]).toMatchObject({ nombre: "Rocco", raza: "Husky" });
    expect(reducir(e, { tipo: "mascota/editar", id: "a", cambios: { nombre: "   " } })).toBe(e);
    expect(reducir(e, { tipo: "mascota/editar", id: "a", cambios: { personaje: "persa" } })).toBe(e);
  });

  it("los registros y cuidados pertenecen a cada mascota y se van con ella", () => {
    let e: EstadoApp = reducir(estadoVacio(), { tipo: "mascota/agregar", mascota: nueva("a", "Rocky") });
    e = reducir(e, { tipo: "mascota/agregar", mascota: nueva("b", "Max") });
    e = reducir(e, { tipo: "registro/agregar", registro: peso("p1", "a", 20) });
    e = reducir(e, { tipo: "registro/agregar", registro: peso("p2", "b", 8) });
    e = reducir(e, { tipo: "registro/agregar", registro: peso("p3", "fantasma", 1) });
    expect(e.registros.map((r) => r.id)).toEqual(["p1", "p2"]);

    const c = crearCuidado({ mascotaId: "a", categoria: "visita", titulo: "Control", fecha: "2026-10-20" }, { id: "c1", hoy: HOY });
    if (!c.ok) throw new Error("cuidado inválido");
    e = reducir(e, { tipo: "cuidado/programar", cuidado: c.cuidado });
    e = reducir(e, { tipo: "cuidado/completar", id: "c1", fecha: HOY });
    expect(e.cuidados[0].completadoEn).toBe(HOY);
    e = reducir(e, { tipo: "cuidado/reabrir", id: "c1" });
    expect(e.cuidados[0].completadoEn).toBeUndefined();
    e = reducir(e, { tipo: "cuidado/completar", id: "c1", fecha: HOY });

    e = reducir(e, { tipo: "mascota/eliminar", id: "a" });
    expect(e.mascotas.map((m) => m.id)).toEqual(["b"]);
    expect(e.registros.map((r) => r.id)).toEqual(["p2"]);
    expect(e.cuidados).toEqual([]);
    expect(e.mascotaActivaId).toBe("b");

    e = reducir(e, { tipo: "registro/eliminar", id: "p2" });
    expect(e.registros).toEqual([]);
  });

  it("la demostración se carga una sola vez y se quita sin tocar los datos reales", () => {
    const real = reducir(estadoVacio(), { tipo: "mascota/agregar", mascota: nueva("real", "Rocky"), registros: [peso("rp", "real", 20)] });
    const demo = crearDemo(HOY);
    let e = reducir(real, { tipo: "demo/cargar", demo });
    expect(e.mascotas).toHaveLength(3);
    expect(hayDatosDemo(e)).toBe(true);
    expect(e.mascotaActivaId).toBe("real");
    expect(reducir(e, { tipo: "demo/cargar", demo })).toBe(e);

    e = reducir(e, { tipo: "demo/quitar" });
    expect(e.mascotas.map((m) => m.id)).toEqual(["real"]);
    expect(e.registros.map((r) => r.id)).toEqual(["rp"]);
    expect(e.cuidados).toEqual([]);
    expect(hayDatosDemo(e)).toBe(false);
  });

  it("todo el contenido de demostración está rotulado como demo", () => {
    const demo = crearDemo(HOY);
    expect(demo.mascotas.every((m) => m.origen === "demo" && m.id.startsWith("demo-"))).toBe(true);
    expect(demo.registros.every((r) => r.origen === "demo")).toBe(true);
    expect(demo.cuidados.every((c) => c.origen === "demo")).toBe(true);
    expect(demo.registros.every((r) => r.fecha <= HOY)).toBe(true);
  });

  it("limita las mascotas propias según el plan, sin contar la demostración", () => {
    let e = reducir(estadoVacio(), { tipo: "demo/cargar", demo: crearDemo(HOY) });
    expect(puedeAgregarMascota(e, HOY)).toBe(true);
    e = reducir(e, { tipo: "mascota/agregar", mascota: nueva("a", "Rocky") });
    expect(puedeAgregarMascota(e, HOY)).toBe(false);
    e = reducir(e, { tipo: "plan/establecer", plan: "prueba-simulada", hoy: HOY });
    expect(e.pruebaIniciadaEn).toBe(HOY);
    expect(puedeAgregarMascota(e, HOY)).toBe(true);
    e = reducir(e, { tipo: "plan/establecer", plan: "gratis", hoy: HOY });
    expect(e.pruebaIniciadaEn).toBeNull();
    // bajar de plan nunca borra ni bloquea lo ya guardado
    expect(e.mascotas.some((m) => m.id === "a")).toBe(true);
  });

  it("reinicia todo", () => {
    const e = reducir(estadoVacio(), { tipo: "mascota/agregar", mascota: nueva("a", "Rocky") });
    expect(reducir(e, { tipo: "estado/reiniciar" })).toEqual(estadoVacio());
  });
});
