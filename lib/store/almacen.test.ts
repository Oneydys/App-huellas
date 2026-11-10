import { describe, expect, it } from "vitest";
import { crearDemo } from "../demo";
import { crearMascota } from "../mascota";
import {
  CLAVE_ALMACEN,
  CLAVE_RESPALDO_CORRUPTO,
  cargarEstado,
  exportarJSON,
  guardarEstado,
  importarJSON,
  sanear,
  type AlmacenLike,
} from "./almacen";
import { estadoVacio, VERSION_ESTADO, type EstadoApp } from "./estado";
import { migrarEstado } from "./migraciones";
import { reducir } from "./reductor";

const HOY = "2026-10-10";

function memoria(inicial: Record<string, string> = {}): AlmacenLike & { datos: Record<string, string> } {
  const datos = { ...inicial };
  return {
    datos,
    getItem: (k) => datos[k] ?? null,
    setItem: (k, v) => {
      datos[k] = v;
    },
    removeItem: (k) => {
      delete datos[k];
    },
  };
}

function conDemo(): EstadoApp {
  return reducir(estadoVacio(), { tipo: "demo/cargar", demo: crearDemo(HOY) });
}

describe("store: persistencia", () => {
  it("sin datos guardados devuelve un estado vacío y versionado", () => {
    const r = cargarEstado(memoria());
    expect(r.resultado).toBe("vacio");
    expect(r.estado.version).toBe(VERSION_ESTADO);
    expect(r.estado.mascotas).toEqual([]);
  });

  it("guarda y vuelve a leer exactamente lo mismo", () => {
    const m = memoria();
    const estado = conDemo();
    expect(guardarEstado(m, estado)).toBe(true);
    expect(cargarEstado(m)).toEqual({ estado, resultado: "ok" });
  });

  it("si el almacenamiento falla, lo informa en vez de romperse", () => {
    const lleno: AlmacenLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error("cuota");
      },
      removeItem: () => {},
    };
    expect(guardarEstado(lleno, conDemo())).toBe(false);
  });

  it("ante datos corruptos conserva un respaldo y empieza vacío", () => {
    const m = memoria({ [CLAVE_ALMACEN]: "{no es json" });
    const r = cargarEstado(m);
    expect(r.resultado).toBe("recuperado-con-respaldo");
    expect(r.estado.mascotas).toEqual([]);
    expect(m.datos[CLAVE_RESPALDO_CORRUPTO]).toBe("{no es json");

    const incompleto = memoria({ [CLAVE_ALMACEN]: JSON.stringify({ version: 1, mascotas: [{ id: "x" }] }) });
    expect(cargarEstado(incompleto).resultado).toBe("recuperado-con-respaldo");
  });

  it("migra el formato anterior sin versión y rechaza versiones futuras", () => {
    const antiguo = migrarEstado({ mascotas: [] });
    expect(antiguo.ok && antiguo.estado.version).toBe(VERSION_ESTADO);
    expect(antiguo.ok && antiguo.estado.plan).toBe("gratis");

    const futuro = migrarEstado({ ...estadoVacio(), version: 99 });
    expect(futuro.ok).toBe(false);
    expect(migrarEstado("texto").ok).toBe(false);
    expect(migrarEstado(null).ok).toBe(false);
  });

  it("migra un estado antiguo que ya traía mascotas válidas", () => {
    const demo = crearDemo(HOY);
    const r = migrarEstado({ mascotas: demo.mascotas, registros: demo.registros });
    expect(r.ok && r.estado.mascotas).toHaveLength(2);
    expect(r.ok && r.estado.registros).toHaveLength(demo.registros.length);
  });

  it("sanea registros huérfanos y corrige la mascota activa", () => {
    const estado = conDemo();
    const huerfano = { ...estado, mascotas: estado.mascotas.slice(0, 1), mascotaActivaId: "borrada" };
    const limpio = sanear(huerfano);
    expect(limpio.registros.every((r) => r.mascotaId === huerfano.mascotas[0].id)).toBe(true);
    expect(limpio.mascotaActivaId).toBe(huerfano.mascotas[0].id);
  });
});

describe("store: exportar e importar", () => {
  it("la copia de seguridad se importa igual", () => {
    const estado = conDemo();
    const r = importarJSON(exportarJSON(estado, new Date("2026-10-10T12:00:00Z")));
    expect(r).toEqual({ ok: true, estado });
  });

  it("exportar funciona con cualquier plan, incluso sin pagar", () => {
    const sin = reducir(conDemo(), { tipo: "plan/establecer", plan: "gratis", hoy: HOY });
    const texto = exportarJSON(sin);
    expect(JSON.parse(texto).estado.mascotas).toHaveLength(2);
  });

  it("acepta un estado suelto y rechaza archivos que no son una copia", () => {
    const e = crearMascota(
      { nombre: "Luna", especie: "gato", personaje: "europeo", nacimiento: "2024-01-01", nacimientoAproximado: false, raza: "", pais: "CO", prioridad: "vacuna" },
      { id: "m", hoy: HOY },
    );
    if (!e.ok) throw new Error("mascota inválida");
    const estado = reducir(estadoVacio(), { tipo: "mascota/agregar", mascota: e.mascota });
    expect(importarJSON(JSON.stringify(estado))).toEqual({ ok: true, estado });
    expect(importarJSON("hola").ok).toBe(false);
    expect(importarJSON(JSON.stringify({ formato: "huellas-copia", estado: { version: 1, mascotas: 5 } })).ok).toBe(false);
    expect(importarJSON("[]").ok).toBe(false);
  });
});
