"use client";

import { useCallback } from "react";
import { useRegistroRapido } from "@/components/registro-rapido";
import { useAvisos } from "@/components/toast";
import type { PropuestaCuidado } from "@/lib/calendario-vivo";
import { datosDeHechoRapido } from "@/lib/hecho-rapido";
import { crearRegistro, ETIQUETA_TIPO } from "@/lib/registros";
import { nuevoId, useHuellas } from "@/lib/store/hooks";

/**
 * "Hecho hoy" en un toque: guarda el registro y marca el cuidado, con un aviso para deshacer.
 * Si hace falta un dato (peso, medicamento) abre la hoja de registro en vez de inventarlo.
 */
export function useHechoHoy() {
  const { hoy, despachar } = useHuellas();
  const { mostrar } = useAvisos();
  const { abrir } = useRegistroRapido();

  return useCallback(
    (p: PropuestaCuidado) => {
      const datos = datosDeHechoRapido(p, p.mascotaId, hoy);
      const r = datos ? crearRegistro(datos, { id: nuevoId("r"), hoy }) : null;
      if (!r || !r.ok) {
        abrir({ tipo: p.categoria, cuidadoId: p.cuidadoId });
        return;
      }
      despachar({ tipo: "registro/agregar", registro: r.registro });
      if (p.cuidadoId) despachar({ tipo: "cuidado/completar", id: p.cuidadoId, fecha: hoy });
      mostrar(`Listo: registramos «${ETIQUETA_TIPO[r.registro.tipo]}» de hoy.`, {
        etiqueta: "Deshacer",
        alHacer: () => {
          despachar({ tipo: "registro/eliminar", id: r.registro.id });
          if (p.cuidadoId) despachar({ tipo: "cuidado/reabrir", id: p.cuidadoId });
        },
      });
    },
    [hoy, despachar, mostrar, abrir],
  );
}
