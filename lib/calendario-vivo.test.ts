import { describe, expect, it } from "vitest";
import type { CalendarioPais } from "./calendarios-pais";
import { calendarioVerificado, CALENDARIOS_PAIS } from "./calendarios-pais";
import {
  calcularCalendario,
  cuidadoDestacado,
  estadoDeCategoria,
  estadoDelMes,
  etiquetaEstado,
  type EntradaCalendario,
} from "./calendario-vivo";
import { crearCuidado } from "./cuidados";
import { nacimientoDesdeEdad, type Mascota } from "./mascota";
import { crearRegistro, type Registro } from "./registros";

const HOY = "2026-10-10";

function mascota(meses: number, extra: Partial<Mascota> = {}): Mascota {
  return {
    id: "m1",
    nombre: "Luna",
    especie: "gato",
    personaje: "europeo",
    nacimiento: nacimientoDesdeEdad(0, meses, HOY),
    nacimientoAproximado: true,
    raza: "",
    pais: "CO",
    prioridad: "vacuna",
    creadaEn: HOY,
    origen: "usuario",
    ...extra,
  };
}

function registro(datos: Record<string, unknown>, id: string): Registro {
  const r = crearRegistro({ mascotaId: "m1", ...datos }, { id, hoy: HOY });
  if (!r.ok) throw new Error(JSON.stringify(r.errores));
  return r.registro;
}

function calcular(m: Mascota, registros: Registro[] = [], extra: Partial<EntradaCalendario> = {}) {
  return calcularCalendario({ mascota: m, registros, cuidados: [], hoy: HOY, ...extra });
}

const porCategoria = (r: ReturnType<typeof calcular>, c: string) => r.propuestas.find((p) => p.categoria === c);

describe("Calendario Vivo", () => {
  it("sin registros propone cuidados sugeridos y orientativos, nunca atrasados", () => {
    const r = calcular(mascota(50));
    expect(r.etapa).toBe("adulto");
    expect(r.propuestas.map((p) => p.categoria).sort()).toEqual(["desparasitacion", "peso", "vacuna", "visita"]);
    for (const p of r.propuestas) {
      expect(p.tipoFecha).toBe("sugerida");
      expect(p.orientativo).toBe(true);
      expect(p.estado).not.toBe("pasada");
    }
    expect(porCategoria(r, "peso")?.estado).toBe("hoy");
    expect(r.usaReglasGenericas).toBe(true);
  });

  it("estima la fecha desde el último registro según la etapa de vida", () => {
    const adulto = calcular(mascota(50), [registro({ tipo: "vacuna", fecha: "2026-09-02", nombre: "V" }, "v")]);
    expect(porCategoria(adulto, "vacuna")).toMatchObject({ fecha: "2027-09-02", tipoFecha: "estimada" });

    const cria = calcular(mascota(2), [registro({ tipo: "vacuna", fecha: "2026-10-01", nombre: "V" }, "v")]);
    expect(porCategoria(cria, "vacuna")).toMatchObject({ fecha: "2026-10-29", tipoFecha: "estimada" });
  });

  it("se reajusta al cambiar la edad: las crías tienen cuidados más frecuentes", () => {
    const pesos = [registro({ tipo: "peso", fecha: "2026-10-01", kg: 1 }, "p")];
    const diasHastaPeso = (meses: number) => porCategoria(calcular(mascota(meses), pesos), "peso")?.diasRestantes;
    expect(diasHastaPeso(2)).toBe(5); // cría: cada 14 días
    expect(diasHastaPeso(6)).toBe(21); // juvenil: cada 30
    expect(diasHastaPeso(50)).toBe(81); // adulto: cada 90
    expect(diasHastaPeso(100)).toBe(51); // mayor: cada 60
  });

  it("respeta la fecha que indicó el veterinario y marca cuando ya pasó", () => {
    const m = mascota(8, { especie: "perro", personaje: "beagle" });
    const futura = calcular(m, [registro({ tipo: "vacuna", fecha: "2026-09-20", nombre: "V", proximaFecha: "2026-10-18" }, "v")]);
    expect(porCategoria(futura, "vacuna")).toMatchObject({ fecha: "2026-10-18", tipoFecha: "indicada", orientativo: false, estado: "proxima", titulo: "Próxima dosis: V" });

    const pasada = calcular(m, [registro({ tipo: "vacuna", fecha: "2026-08-01", nombre: "V", proximaFecha: "2026-09-01" }, "v")]);
    expect(porCategoria(pasada, "vacuna")).toMatchObject({ tipoFecha: "indicada", estado: "pasada" });
  });

  it("un cuidado programado por la persona reemplaza a la regla de su categoría", () => {
    const c = crearCuidado({ mascotaId: "m1", categoria: "visita", titulo: "Control dental", fecha: "2026-10-20" }, { id: "c1", hoy: HOY });
    if (!c.ok) throw new Error("cuidado inválido");
    const r = calcular(mascota(50), [], { cuidados: [c.cuidado] });
    const visitas = r.propuestas.filter((p) => p.categoria === "visita");
    expect(visitas).toHaveLength(1);
    expect(visitas[0]).toMatchObject({ titulo: "Control dental", tipoFecha: "programada", origen: "usuario", cuidadoId: "c1" });

    const hecho = calcular(mascota(50), [], { cuidados: [{ ...c.cuidado, completadoEn: HOY }] });
    expect(hecho.propuestas.find((p) => p.origen === "usuario")).toBeUndefined();
  });

  it("agrega el fin de un tratamiento con la fecha anotada, solo si no ha pasado", () => {
    const r = calcular(mascota(50), [
      registro({ tipo: "medicamento", fecha: "2026-10-05", nombre: "Ejemplo", fin: "2026-10-15" }, "a"),
      registro({ tipo: "medicamento", fecha: "2026-09-01", nombre: "Viejo", fin: "2026-09-10" }, "b"),
    ]);
    const meds = r.propuestas.filter((p) => p.categoria === "medicamento");
    expect(meds).toHaveLength(1);
    expect(meds[0]).toMatchObject({ titulo: "Fin del tratamiento: Ejemplo", diasRestantes: 5, tipoFecha: "indicada" });
  });

  it("ignora registros de otras mascotas", () => {
    const ajeno = { ...registro({ tipo: "vacuna", fecha: "2026-09-02", nombre: "V" }, "x"), mascotaId: "otra" };
    expect(porCategoria(calcular(mascota(50), [ajeno]), "vacuna")?.tipoFecha).toBe("sugerida");
  });

  it("ordena por fecha", () => {
    const fechas = calcular(mascota(50)).propuestas.map((p) => p.fecha);
    expect(fechas).toEqual([...fechas].sort());
  });

  it("destaca primero lo que ya pasó de fecha y luego la prioridad elegida", () => {
    const m = mascota(50);
    const sin = calcular(m);
    expect(cuidadoDestacado(sin.propuestas, "vacuna")?.categoria).toBe("vacuna");
    expect(cuidadoDestacado(sin.propuestas, "peso")?.categoria).toBe("peso");
    expect(cuidadoDestacado([], "peso")).toBeUndefined();

    const conPasado = calcular(m, [registro({ tipo: "desparasitacion", fecha: "2026-05-01", via: "interna" }, "d")]);
    expect(cuidadoDestacado(conPasado.propuestas, "vacuna")?.categoria).toBe("desparasitacion");
  });
});

describe("estados sin alarmismo", () => {
  const m = mascota(50);
  const cat = (regs: Registro[], categoria: "vacuna" | "peso" = "vacuna") => {
    const { propuestas } = calcular(m, regs);
    return estadoDeCategoria(categoria, regs, propuestas, m.id);
  };

  it("sin registros no afirma nada: dice sin registro", () => {
    expect(cat([]).estado).toBe("sin-registro");
  });

  it("con un registro reciente está al día según los registros", () => {
    expect(cat([registro({ tipo: "vacuna", fecha: "2026-09-02", nombre: "V" }, "v")]).estado).toBe("al-dia");
  });

  it("marca próximo cuando la fecha cae en los próximos 30 días", () => {
    expect(cat([registro({ tipo: "vacuna", fecha: "2025-10-20", nombre: "V" }, "v")]).estado).toBe("proximo");
  });

  it("marca que pasó la fecha, sin más dramatismo", () => {
    expect(cat([registro({ tipo: "vacuna", fecha: "2025-01-02", nombre: "V" }, "v")]).estado).toBe("pasada");
  });

  it("resume el mes: pendientes, fechas pasadas y registros hechos", () => {
    const regs = [
      registro({ tipo: "peso", fecha: "2026-10-03", kg: 4 }, "p"),
      registro({ tipo: "vacuna", fecha: "2025-01-02", nombre: "V" }, "v"),
    ];
    const { propuestas } = calcular(m, regs);
    const mes = estadoDelMes(propuestas, regs, m.id, HOY);
    expect(mes.hechosEsteMes).toBe(1);
    expect(mes.pasaronFecha).toBe(1);
  });

  it("nombra los estados con palabras tranquilas", () => {
    const { propuestas } = calcular(m, [registro({ tipo: "peso", fecha: "2026-10-01", kg: 4 }, "p")]);
    expect(propuestas.map(etiquetaEstado).join(" ")).not.toMatch(/vencid|atrasad|urgente|peligro/i);
  });
});

describe("calendarios por país", () => {
  const verificado: CalendarioPais = {
    pais: "CO",
    verificado: true,
    verificadoPor: "Quien administra",
    verificadoEn: HOY,
    fuentes: [{ nombre: "Fuente de prueba", url: "https://example.org", consultadoEn: HOY }],
    reglas: [
      {
        id: "co-vacuna-adulto",
        categoria: "vacuna",
        especies: ["gato", "perro"],
        etapas: ["adulto"],
        titulo: "Regla de prueba",
        detalle: "Solo para pruebas",
        intervaloDias: 100,
        primeraVezDias: 10,
      },
    ],
  };

  it("la plantilla no trae ningún calendario verificado", () => {
    expect(CALENDARIOS_PAIS.filter((c) => c.verificado)).toEqual([]);
    expect(CALENDARIOS_PAIS.every((c) => c.esEjemplo === true)).toBe(true);
  });

  it("nunca aplica entradas sin verificar, sin fuentes o de ejemplo", () => {
    expect(calendarioVerificado("CO", [{ ...verificado, verificado: false }])).toBeUndefined();
    expect(calendarioVerificado("CO", [{ ...verificado, fuentes: [] }])).toBeUndefined();
    expect(calendarioVerificado("CO", [{ ...verificado, esEjemplo: true }])).toBeUndefined();
    expect(calendarioVerificado("CO", [{ ...verificado, fuentes: [{ nombre: "", url: "", consultadoEn: HOY }] }])).toBeUndefined();
    expect(calendarioVerificado("MX", [verificado])).toBeUndefined();

    const r = calcular(mascota(50), [], { calendarios: [{ ...verificado, verificado: false }] });
    expect(r.calendarioPais).toBeUndefined();
    expect(r.propuestas.some((p) => p.origen === "pais")).toBe(false);
  });

  it("usa un calendario verificado solo para la categoría que cubre", () => {
    const r = calcular(mascota(50), [registro({ tipo: "vacuna", fecha: "2026-09-02", nombre: "V" }, "v")], { calendarios: [verificado] });
    expect(r.calendarioPais?.pais).toBe("CO");
    expect(porCategoria(r, "vacuna")).toMatchObject({ origen: "pais", fecha: "2026-12-11", orientativo: true });
    expect(porCategoria(r, "peso")?.origen).toBe("regla");
    expect(r.usaReglasGenericas).toBe(true);
  });
});
