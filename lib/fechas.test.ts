import { describe, expect, it } from "vitest";
import {
  describirDias,
  diasEntre,
  esFechaISO,
  formatearFecha,
  hoyISO,
  mesesCumplidos,
  semanasDelMes,
  sumarDias,
  sumarMeses,
} from "./fechas";

describe("fechas", () => {
  it("valida fechas reales y rechaza las imposibles", () => {
    expect(esFechaISO("2026-02-28")).toBe(true);
    expect(esFechaISO("2028-02-29")).toBe(true);
    expect(esFechaISO("2026-02-29")).toBe(false);
    expect(esFechaISO("2026-13-01")).toBe(false);
    expect(esFechaISO("10/10/2026")).toBe(false);
  });

  it("usa la fecha local del dispositivo para hoy", () => {
    expect(hoyISO(new Date(2026, 9, 10, 23, 59))).toBe("2026-10-10");
    expect(hoyISO(new Date(2026, 0, 5, 0, 1))).toBe("2026-01-05");
  });

  it("suma y resta días sin errores de horario de verano", () => {
    expect(sumarDias("2026-10-10", 30)).toBe("2026-11-09");
    expect(sumarDias("2026-03-01", -1)).toBe("2026-02-28");
    expect(diasEntre("2026-10-10", "2026-10-22")).toBe(12);
    expect(diasEntre("2026-10-10", "2026-10-07")).toBe(-3);
  });

  it("suma meses ajustando el último día del mes", () => {
    expect(sumarMeses("2026-01-31", 1)).toBe("2026-02-28");
    expect(sumarMeses("2026-10-10", -50)).toBe("2022-08-10");
    expect(sumarMeses("2026-10-10", 14)).toBe("2027-12-10");
  });

  it("cuenta meses cumplidos", () => {
    expect(mesesCumplidos("2026-01-15", "2026-02-14")).toBe(0);
    expect(mesesCumplidos("2026-01-15", "2026-02-15")).toBe(1);
    expect(mesesCumplidos("2022-08-10", "2026-10-10")).toBe(50);
    expect(mesesCumplidos("2026-10-10", "2026-01-01")).toBe(0);
  });

  it("arma las semanas de un mes de lunes a domingo", () => {
    const semanas = semanasDelMes(2026, 10); // el 1 de octubre de 2026 es jueves
    expect(semanas.every((s) => s.length === 7)).toBe(true);
    expect(semanas[0][0].fecha).toBe("2026-09-28");
    expect(semanas[0][3]).toEqual({ fecha: "2026-10-01", delMes: true });
    expect(semanas[0][0].delMes).toBe(false);
    expect(semanas.at(-1)?.at(-1)?.fecha).toBe("2026-11-01");
  });

  it("da formato en español", () => {
    expect(formatearFecha("2026-09-02")).toBe("2 de septiembre de 2026");
    expect(formatearFecha("2026-09-02", "corta")).toMatch(/^2 sep/);
  });

  it("describe distancias en días", () => {
    expect(describirDias(0)).toBe("Hoy");
    expect(describirDias(1)).toBe("Mañana");
    expect(describirDias(12)).toBe("En 12 días");
    expect(describirDias(-3)).toBe("Hace 3 días");
  });
});
