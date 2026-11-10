"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Marco } from "@/components/marco";
import { MarcoTelefono } from "@/components/marco-telefono";
import { Aviso } from "@/components/ui/aviso";
import { Boton } from "@/components/ui/boton";
import { Chip } from "@/components/ui/chip";
import { PantallaCargando } from "@/components/ui/esqueleto";
import { Logotipo } from "@/components/ui/mascota-avatar";
import { NavLegal } from "@/components/nav-legal";
import { cn } from "@/lib/cn";
import { ahorroAnualPorcentaje, avisosDePlantilla, formatearPrecio, PLANTILLA, textoGarantia } from "@/lib/plantilla";
import { iniciarSuscripcion, type PeriodoPlan } from "@/lib/servicios";
import { useHuellas } from "@/lib/store/hooks";
import { useRequiereMascota } from "@/lib/store/guardias";

export default function Paywall() {
  useRequiereMascota();
  const router = useRouter();
  const { listo, mascota, hoy, despachar } = useHuellas();
  const [periodo, setPeriodo] = useState<PeriodoPlan>("anual");
  const [enCurso, setEnCurso] = useState(false);
  const [error, setError] = useState("");
  const { precios } = PLANTILLA;

  async function elegir(plan: "prueba-simulada" | "gratis") {
    setEnCurso(true);
    setError("");
    try {
      if (plan === "prueba-simulada") {
        const r = await iniciarSuscripcion(periodo);
        if (!r.ok) throw new Error(r.error);
      }
      despachar({ tipo: "plan/establecer", plan, hoy });
      router.push("/acceso");
    } catch {
      // Si el servicio de planes falla, la persona nunca queda atrapada: puede seguir gratis.
      setError("No pudimos iniciar la prueba. Puedes intentarlo de nuevo o seguir con el plan gratis: tu historial no se pierde.");
      setEnCurso(false);
    }
  }

  const opciones: { id: PeriodoPlan; nombre: string; precio: string; unidad: string; nota: string; destacado?: boolean }[] = [
    { id: "mensual", nombre: "Mensual", precio: formatearPrecio(precios.mensual), unidad: "/ mes", nota: "Mes a mes" },
    {
      id: "anual",
      nombre: "Anual",
      precio: formatearPrecio(precios.anual),
      unidad: "/ año",
      nota: `Equivale a ${formatearPrecio(precios.anual / 12)} al mes`,
      destacado: true,
    },
  ];

  return (
    <Marco>
      <header>
        <Logotipo />
      </header>
      {!listo || !mascota ? (
        <div className="mt-6">
          <PantallaCargando />
        </div>
      ) : (
        <>
          <p className="mt-6 text-etiqueta font-black tracking-wider text-aviso">HUELLAS PRO</p>
          <h1 className="mt-2 text-display font-black tracking-tight">Ya puedes usar el carnet de {mascota.nombre}</h1>
          <p className="mt-2 text-cuerpo text-suave-texto">
            Gratis: un carnet completo para una mascota. Pro permite hasta {PLANTILLA.limites.mascotasPro} mascotas.
          </p>

          <div role="radiogroup" aria-label="Plan" className="mt-6 grid grid-cols-2 gap-3">
            {opciones.map((o) => {
              const activo = periodo === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  onClick={() => setPeriodo(o.id)}
                  className={cn(
                    "flex flex-col items-start rounded-tarjeta border-2 p-3 text-left transition-[transform,border-color,background-color] duration-[120ms] ease-huellas active:scale-[0.97] min-[400px]:p-4",
                    activo ? "border-naranja bg-hundido shadow-calida" : "border-linea bg-papel",
                  )}
                >
                  <span className="text-cuerpo font-black">{o.nombre}</span>
                  <span className="mt-2 text-titulo font-black">{o.precio}</span>
                  <span className="text-cuerpo text-suave-texto">{o.unidad}</span>
                  <span className="mt-auto pt-2 text-cuerpo text-suave-texto">{o.nota}</span>
                  {o.destacado && <Chip tono="naranja" className="mt-2">Ahorras {ahorroAnualPorcentaje()} %</Chip>}
                </button>
              );
            })}
          </div>
          {precios.diasPrueba > 0 && (
            <p className="mt-3 text-center text-cuerpo text-suave-texto">
              {PLANTILLA.modoSimulacion
                ? `Prueba de ${precios.diasPrueba} días (simulación): no se cobra nada.`
                : `Prueba de ${precios.diasPrueba} días.`}
            </p>
          )}

          <ul className="mt-6 flex flex-col gap-3">
            {PLANTILLA.beneficiosPro.map((b) => (
              <li key={b.titulo} className="flex items-start gap-3">
                <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-exito" />
                <div>
                  <p className="text-cuerpo font-black">{b.titulo}</p>
                  <p className="text-cuerpo text-suave-texto">{b.detalle}</p>
                </div>
              </li>
            ))}
          </ul>

          <section aria-label="Siempre gratis" className="mt-6 rounded-tarjeta bg-hundido p-4">
            <h2 className="text-cuerpo font-black">Incluido también en el plan gratis</h2>
            <ul className="mt-2 flex flex-col gap-1">
              {PLANTILLA.siempreGratis.map((t) => (
                <li key={t} className="flex items-start gap-2 text-cuerpo">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-exito" />
                  {t}
                </li>
              ))}
            </ul>
          </section>


          <section aria-labelledby="ya-tienes" className="mt-6 flex items-center gap-4 rounded-tarjeta border border-linea bg-papel p-4">
            <MarcoTelefono
              src="/images/capturas/carnet.png"
              alt="Carnet digital de una mascota en la app, con foto, datos y vacunas"
              ancho={96}
              className="rounded-control"
            />
            <div>
              <h2 id="ya-tienes" className="text-cuerpo font-black">
                Esto ya lo tienes
              </h2>
              <p className="text-cuerpo text-suave-texto">El carnet de {mascota.nombre} funciona hoy, con o sin plan. Captura real de la app.</p>
            </div>
          </section>

          <div className="mt-6 flex flex-col gap-3">
            {avisosDePlantilla && <Aviso>{PLANTILLA.textos.avisoSimulacion}</Aviso>}
          </div>

          <NavLegal prefijo="Al continuar aceptas" className="mt-6" />

          <div className="sticky bottom-0 -mx-6 mt-6 border-t border-linea bg-papel/95 px-6 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
            {error && (
              <p role="alert" className="mb-2 rounded-control bg-hundido p-3 text-cuerpo font-bold text-error">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-2">
              {precios.diasPrueba > 0 && (
                <Boton disabled={enCurso} onClick={() => elegir("prueba-simulada")}>
                  {enCurso ? "Un momento…" : `Probar ${precios.diasPrueba} días${PLANTILLA.modoSimulacion ? " (simulación)" : ""}`}
                </Boton>
              )}
              <Boton
                variante={precios.diasPrueba > 0 ? "fantasma" : "primario"}
                disabled={enCurso}
                onClick={() => elegir("gratis")}
              >
                Seguir con el plan gratis
              </Boton>
            </div>
            <p className="mt-1 text-center text-cuerpo text-suave-texto">{textoGarantia()}</p>
          </div>
        </>
      )}
    </Marco>
  );
}
