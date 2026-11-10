import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Pruebas estáticas de la migración: no necesitan base de datos.
// Las pruebas de RLS con dos cuentas reales están en lib/backend/rls.test.ts (se saltan sin configuración).

const RUTA = fileURLToPath(new URL("../../supabase/migrations/0001_nucleo.sql", import.meta.url));

/** SQL sin comentarios de línea, en minúsculas, dividido en sentencias. */
function sentencias(): string[] {
  const sql = readFileSync(RUTA, "utf8")
    .split(/\r?\n/)
    .map((linea) => linea.replace(/--.*$/, ""))
    .join("\n")
    .toLowerCase();
  return sql
    .split(";")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 0);
}

const SQL = sentencias();

function tablasCreadas(): string[] {
  return SQL.flatMap((s) => {
    const m = /^create table public\.([a-z_]+)/.exec(s);
    return m?.[1] ? [m[1]] : [];
  });
}

describe("migración 0001: RLS y privilegios", () => {
  it("crea las tablas mínimas: accesos, compras y mascotas", () => {
    expect(tablasCreadas().sort()).toEqual(["accesos", "compras", "mascotas"]);
  });

  it("cada create table tiene enable row level security en la misma migración", () => {
    for (const tabla of tablasCreadas()) {
      expect(
        SQL.some((s) => s === `alter table public.${tabla} enable row level security`),
        `Falta RLS en ${tabla}`,
      ).toBe(true);
    }
  });

  it("no se desactiva RLS en ningún punto", () => {
    expect(SQL.some((s) => s.includes("disable row level security"))).toBe(false);
  });

  it("revoca privilegios por defecto a anon en cada tabla", () => {
    for (const tabla of tablasCreadas()) {
      const revocada = SQL.some((s) => s.startsWith(`revoke all on public.${tabla} `) && /\banon\b/.test(s));
      expect(revocada, `Falta revoke de anon en ${tabla}`).toBe(true);
    }
  });

  it("ninguna sentencia concede privilegios a anon", () => {
    expect(SQL.some((s) => /^grant\b/.test(s) && /\banon\b/.test(s))).toBe(false);
  });

  it("toda tabla concedida a authenticated tiene políticas que usan auth.uid()", () => {
    const concedidas = SQL.flatMap((s) => {
      const m = /^grant .* on public\.([a-z_]+) to authenticated$/.exec(s);
      return m?.[1] ? [m[1]] : [];
    });
    expect(concedidas.length).toBeGreaterThan(0);
    for (const tabla of concedidas) {
      const politicas = SQL.filter((s) => s.startsWith("create policy") && s.includes(` on public.${tabla} `));
      expect(politicas.length, `Sin políticas en ${tabla}`).toBeGreaterThan(0);
      for (const politica of politicas) {
        expect(politica, `Política sin auth.uid() en ${tabla}`).toContain("auth.uid() = user_id");
        expect(politica, `Política sin destinatario en ${tabla}`).toContain("to authenticated");
      }
    }
  });

  it("compras no se concede a clientes: ninguna sentencia la expone a authenticated", () => {
    expect(SQL.some((s) => s.startsWith("grant") && s.includes("public.compras") && s.includes("authenticated"))).toBe(
      false,
    );
    expect(SQL.some((s) => s.startsWith("create policy") && s.includes("public.compras"))).toBe(false);
  });

  it("ninguna política es abierta a todos (to public o sin destinatario)", () => {
    for (const s of SQL.filter((x) => x.startsWith("create policy"))) {
      expect(s).not.toMatch(/\bto public\b/);
      expect(s).toMatch(/\bto authenticated\b/);
    }
  });

  it("mascotas usa with check, así un usuario no puede asignar una mascota a otro", () => {
    const politica = SQL.find((s) => s.startsWith("create policy mascotas_propias"));
    expect(politica).toBeDefined();
    expect(politica).toContain("with check (auth.uid() = user_id)");
  });

  it("accesos no tiene políticas de escritura para clientes", () => {
    const politicas = SQL.filter((s) => s.startsWith("create policy") && s.includes("public.accesos"));
    expect(politicas.length).toBeGreaterThan(0);
    for (const politica of politicas) {
      expect(politica).toContain("for select");
    }
    expect(SQL.some((s) => s.startsWith("grant") && s.includes("public.accesos") && /insert|update|delete/.test(s))).toBe(
      false,
    );
  });
});
