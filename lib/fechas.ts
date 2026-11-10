// Fechas como texto "AAAA-MM-DD" (sin hora ni zona horaria): evita desfases de un día.
export type FechaISO = string;

const PATRON = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_DIA = 86_400_000;

export function esFechaISO(valor: string): boolean {
  const m = PATRON.exec(valor);
  if (!m) return false;
  const anio = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  const f = new Date(Date.UTC(anio, mes - 1, dia));
  return f.getUTCFullYear() === anio && f.getUTCMonth() === mes - 1 && f.getUTCDate() === dia;
}

function aUTC(fecha: FechaISO): number {
  const m = PATRON.exec(fecha);
  if (!m) throw new Error(`Fecha inválida: ${fecha}`);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function deUTC(ms: number): FechaISO {
  const f = new Date(ms);
  const mm = String(f.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(f.getUTCDate()).padStart(2, "0");
  return `${String(f.getUTCFullYear()).padStart(4, "0")}-${mm}-${dd}`;
}

/** Fecha de hoy en la zona horaria del dispositivo. */
export function hoyISO(ahora: Date = new Date()): FechaISO {
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const dd = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mm}-${dd}`;
}

export function diasEntre(desde: FechaISO, hasta: FechaISO): number {
  return Math.round((aUTC(hasta) - aUTC(desde)) / MS_DIA);
}

export function sumarDias(fecha: FechaISO, dias: number): FechaISO {
  return deUTC(aUTC(fecha) + dias * MS_DIA);
}

/** Suma meses conservando el día; si el mes destino es más corto, usa su último día. */
export function sumarMeses(fecha: FechaISO, meses: number): FechaISO {
  const f = new Date(aUTC(fecha));
  const dia = f.getUTCDate();
  const destino = new Date(Date.UTC(f.getUTCFullYear(), f.getUTCMonth() + meses, 1));
  const ultimo = new Date(
    Date.UTC(destino.getUTCFullYear(), destino.getUTCMonth() + 1, 0),
  ).getUTCDate();
  destino.setUTCDate(Math.min(dia, ultimo));
  return deUTC(destino.getTime());
}

/** Meses completos transcurridos entre dos fechas (0 si `hasta` es anterior). */
export function mesesCumplidos(desde: FechaISO, hasta: FechaISO): number {
  const a = new Date(aUTC(desde));
  const b = new Date(aUTC(hasta));
  let meses = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  if (b.getUTCDate() < a.getUTCDate()) meses -= 1;
  return Math.max(0, meses);
}

export function anioMes(fecha: FechaISO): { anio: number; mes: number } {
  const f = new Date(aUTC(fecha));
  return { anio: f.getUTCFullYear(), mes: f.getUTCMonth() + 1 };
}

export function crearFecha(anio: number, mes: number, dia: number): FechaISO {
  return deUTC(Date.UTC(anio, mes - 1, dia));
}

export interface DiaDeCalendario {
  fecha: FechaISO;
  delMes: boolean;
}

/** Semanas (lunes a domingo) que cubren el mes indicado. `mes` va de 1 a 12. */
export function semanasDelMes(anio: number, mes: number): DiaDeCalendario[][] {
  const primero = Date.UTC(anio, mes - 1, 1);
  const desfase = (new Date(primero).getUTCDay() + 6) % 7; // lunes = 0
  const totalDias = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const celdas = Math.ceil((desfase + totalDias) / 7) * 7;
  const semanas: DiaDeCalendario[][] = [];
  for (let i = 0; i < celdas; i += 7) {
    semanas.push(
      Array.from({ length: 7 }, (_, j) => {
        const ms = primero + (i + j - desfase) * MS_DIA;
        return { fecha: deUTC(ms), delMes: new Date(ms).getUTCMonth() === mes - 1 };
      }),
    );
  }
  return semanas;
}

const LOCALE = "es-419";

export function formatearFecha(fecha: FechaISO, estilo: "corta" | "larga" = "larga"): string {
  const opciones: Intl.DateTimeFormatOptions =
    estilo === "larga"
      ? { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
      : { day: "numeric", month: "short", timeZone: "UTC" };
  return new Intl.DateTimeFormat(LOCALE, opciones).format(new Date(aUTC(fecha)));
}

export function nombreDeMes(anio: number, mes: number): string {
  const texto = new Intl.DateTimeFormat(LOCALE, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(anio, mes - 1, 1)));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "Hoy", "Mañana", "En 12 días", "Hace 3 días". */
export function describirDias(dias: number): string {
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Mañana";
  if (dias === -1) return "Ayer";
  if (dias > 1) return `En ${dias} días`;
  return `Hace ${Math.abs(dias)} días`;
}
