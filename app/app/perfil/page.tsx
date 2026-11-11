"use client";

import { ChevronRight, Cookie, Download, FileText, PawPrint, RotateCcw, ShieldCheck, Siren, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { DialogoQuitarDemo } from "@/components/quitar-demo";
import { Aviso } from "@/components/ui/aviso";
import { Aparece, Escalonado } from "@/components/ui/aparece";
import { Boton, BotonLink } from "@/components/ui/boton";
import { Chip } from "@/components/ui/chip";
import { Hoja } from "@/components/ui/hoja";
import { crearDemo } from "@/lib/demo";
import { descargarArchivo } from "@/lib/descargar";
import { formatearFecha } from "@/lib/fechas";
import { limiteDeMascotas, PLANTILLA } from "@/lib/plantilla";
import { exportarJSON, importarJSON, nombreArchivoCopia } from "@/lib/store/almacen";
import type { EstadoApp } from "@/lib/store/estado";
import { hayDatosDemo, planVigente } from "@/lib/store/selectores";
import { useHuellas } from "@/lib/store/hooks";

function Fila({ href, icono: Icono, titulo, texto }: { href: string; icono: typeof PawPrint; titulo: string; texto: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center gap-3 rounded-tarjeta border border-linea bg-papel p-4 transition-transform duration-[120ms] active:scale-[0.98]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-control bg-hundido text-naranja">
        <Icono aria-hidden className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-cuerpo font-black">{titulo}</span>
        <span className="block text-cuerpo text-suave-texto">{texto}</span>
      </span>
      <ChevronRight aria-hidden className="size-5 shrink-0 text-suave" />
    </Link>
  );
}

export default function Perfil() {
  const router = useRouter();
  const { estado, hoy, despachar } = useHuellas();
  const archivo = useRef<HTMLInputElement>(null);
  const [pendiente, setPendiente] = useState<EstadoApp | null>(null);
  const [errorCopia, setErrorCopia] = useState("");
  const [quitarDemo, setQuitarDemo] = useState(false);
  const [borrarTodo, setBorrarTodo] = useState(false);
  const demo = hayDatosDemo(estado);
  const plan = planVigente(estado, hoy);
  const enPrueba = plan === "prueba-simulada";
  const pruebaTerminada = estado.plan === "prueba-simulada" && !enPrueba;

  async function leerCopia(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setErrorCopia("");
    const r = importarJSON(await f.text());
    if (r.ok) setPendiente(r.estado);
    else setErrorCopia(r.error);
  }

  return (
    <Escalonado className="flex flex-col gap-6">
      <Aparece>
        <p className="text-etiqueta font-black tracking-wider text-suave-texto">PERFIL</p>
        <h1 className="text-display font-black tracking-tight">Tu cuenta</h1>
      </Aparece>

      <Aparece className="rounded-tarjeta bg-hundido p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-titulo font-black">
            {enPrueba ? (PLANTILLA.modoSimulacion ? "Prueba simulada" : "Prueba activa") : "Plan gratis"}
          </h2>
          <Chip tono={enPrueba ? "naranja" : "neutro"}>{enPrueba ? "PRO" : "GRATIS"}</Chip>
        </div>
        <p className="mt-1 text-cuerpo">
          Hasta {limiteDeMascotas(plan)} {limiteDeMascotas(plan) === 1 ? "mascota propia" : "mascotas propias"}.
          {enPrueba && estado.pruebaIniciadaEn && ` Desde el ${formatearFecha(estado.pruebaIniciadaEn)}.`}
        </p>
        {pruebaTerminada && (
          <p className="mt-1 text-cuerpo font-bold">Tu prueba terminó. Tus datos siguen aquí; puedes ver los planes cuando quieras.</p>
        )}
        <ul className="mt-3 flex flex-col gap-1 text-cuerpo">
          {PLANTILLA.siempreGratis.map((t) => (
            <li key={t}>· {t}</li>
          ))}
        </ul>
        <BotonLink href="/paywall" variante="secundario" className="mt-4 bg-papel">
          Ver planes
        </BotonLink>
        {PLANTILLA.modoSimulacion && <p className="mt-3 text-cuerpo text-suave-texto">{PLANTILLA.textos.avisoSimulacion}</p>}
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <h2 className="text-titulo font-black">Tu espacio</h2>
        <Fila href="/app/mascotas" icono={PawPrint} titulo="Mis mascotas" texto={`${estado.mascotas.length} en este dispositivo`} />
        <Fila href="/app/urgencia" icono={Siren} titulo="¿Algo te preocupa?" texto="Señales de alerta y cuándo llamar al veterinario" />
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <h2 className="text-titulo font-black">Legal</h2>
        <Fila href="/legal/privacidad" icono={ShieldCheck} titulo="Política de privacidad" texto="Qué datos guardamos y dónde" />
        <Fila href="/legal/terminos" icono={FileText} titulo="Términos de uso" texto="Qué hace y qué no hace Peluvet" />
        <Fila href="/legal/cookies" icono={Cookie} titulo="Política de cookies" texto="Qué guarda la app en tu navegador" />
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <h2 className="text-titulo font-black">Tus datos</h2>
        <p className="text-cuerpo text-suave-texto">{PLANTILLA.textos.avisoAlmacenamiento}</p>
        <Boton
          variante="secundario"
          onClick={() => descargarArchivo(nombreArchivoCopia(), exportarJSON(estado), "application/json")}
        >
          <Download aria-hidden className="size-5" />
          Descargar mis datos
        </Boton>
        <Boton variante="secundario" onClick={() => archivo.current?.click()}>
          <Upload aria-hidden className="size-5" />
          Restaurar desde una copia
        </Boton>
        <input ref={archivo} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden aria-label="Elegir la copia de datos a restaurar" onChange={leerCopia} />
        {errorCopia && (
          <p role="alert" className="text-cuerpo font-bold text-error">
            {errorCopia}
          </p>
        )}
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <h2 className="text-titulo font-black">Demostración</h2>
        <p className="text-cuerpo text-suave-texto">
          Dos mascotas DEMO para explorar. Se pueden quitar y volver a cargar sin tocar tus
          datos.
        </p>
        {demo ? (
          <Boton variante="secundario" onClick={() => setQuitarDemo(true)}>
            <RotateCcw aria-hidden className="size-5" />
            Quitar datos de demostración
          </Boton>
        ) : (
          <Boton variante="secundario" onClick={() => despachar({ tipo: "demo/cargar", demo: crearDemo(hoy) })}>
            Cargar datos de demostración
          </Boton>
        )}
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        <Aviso>{PLANTILLA.textos.avisoNoVeterinario}</Aviso>
        <Boton variante="peligro" onClick={() => setBorrarTodo(true)}>
          <Trash2 aria-hidden className="size-5" />
          Borrar todos mis datos
        </Boton>
      </Aparece>

      <DialogoQuitarDemo abierta={quitarDemo} alCerrar={() => setQuitarDemo(false)} />

      <Hoja abierta={pendiente !== null} titulo="¿Restaurar esta copia?" alCerrar={() => setPendiente(null)}>
        <p className="text-cuerpo text-suave-texto">
          La copia tiene {pendiente?.mascotas.length ?? 0} mascota(s) y {pendiente?.registros.length ?? 0} registro(s). Reemplazará lo
          que hay ahora en este dispositivo.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Boton
            onClick={() => {
              if (pendiente) despachar({ tipo: "estado/reemplazar", estado: pendiente });
              setPendiente(null);
            }}
          >
            Reemplazar mis datos
          </Boton>
          <Boton variante="secundario" onClick={() => setPendiente(null)}>
            Cancelar
          </Boton>
        </div>
      </Hoja>

      <Hoja abierta={borrarTodo} titulo="¿Borrar todos tus datos?" alCerrar={() => setBorrarTodo(false)}>
        <p className="text-cuerpo text-suave-texto">
          Se borran las mascotas, los registros y los cuidados de este dispositivo. No se puede deshacer. Si quieres conservar una
          copia, descárgala antes.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Boton
            variante="peligro"
            onClick={() => {
              despachar({ tipo: "estado/reiniciar" });
              setBorrarTodo(false);
              router.push("/");
            }}
          >
            Sí, borrar todo
          </Boton>
          <Boton variante="secundario" onClick={() => setBorrarTodo(false)}>
            Cancelar
          </Boton>
        </div>
      </Hoja>
    </Escalonado>
  );
}
