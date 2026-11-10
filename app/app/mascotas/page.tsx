"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { reducirFoto } from "@/lib/foto";
import { SinMascota } from "@/components/sin-mascota";
import { Aviso } from "@/components/ui/aviso";
import { Aparece, Escalonado } from "@/components/ui/aparece";
import { Boton, BotonLink } from "@/components/ui/boton";
import { Campo, Selector } from "@/components/ui/campo";
import { Chip } from "@/components/ui/chip";
import { Hoja } from "@/components/ui/hoja";
import { MascotaAvatar } from "@/components/ui/mascota-avatar";
import { cn } from "@/lib/cn";
import { describirEdad, ETIQUETA_PRIORIDAD, mascotaSchema, PRIORIDADES, razaOMestizo, type Mascota, type Prioridad } from "@/lib/mascota";
import { PAISES, type CodigoPais } from "@/lib/paises";
import { ETIQUETA_ESPECIE, personajesDe, type IdPersonaje } from "@/lib/personajes";
import { limiteDeMascotas } from "@/lib/plantilla";
import { planVigente, puedeAgregarMascota } from "@/lib/store/selectores";
import { useHuellas } from "@/lib/store/hooks";

function FormularioEdicion({ mascota, hoy, alGuardar }: { mascota: Mascota; hoy: string; alGuardar: (cambios: Mascota) => void }) {
  const [nombre, setNombre] = useState(mascota.nombre);
  const [raza, setRaza] = useState(mascota.raza);
  const [pais, setPais] = useState<CodigoPais>(mascota.pais);
  const [nacimiento, setNacimiento] = useState(mascota.nacimiento);
  const [aproximada, setAproximada] = useState(mascota.nacimientoAproximado);
  const [prioridad, setPrioridad] = useState<Prioridad>(mascota.prioridad);
  const [personaje, setPersonaje] = useState<IdPersonaje>(mascota.personaje);
  const [foto, setFoto] = useState<string | undefined>(mascota.foto);
  const [errorFoto, setErrorFoto] = useState("");
  const entradaFoto = useRef<HTMLInputElement>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const candidata = { ...mascota, nombre, raza, pais, nacimiento, nacimientoAproximado: aproximada, prioridad, personaje, foto };
    const r = mascotaSchema.safeParse(candidata);
    if (!r.success) {
      const errs: Record<string, string> = {};
      for (const i of r.error.issues) errs[String(i.path[0])] ??= i.message;
      return setErrores(errs);
    }
    if (r.data.nacimiento > hoy) return setErrores({ nacimiento: "La fecha de nacimiento no puede ser futura." });
    alGuardar(r.data);
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <div role="group" aria-label="Personaje" className="flex gap-2">
        {personajesDe(mascota.especie).map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={personaje === p.id}
            aria-label={`${p.nombre}, dije ${p.dije}`}
            onClick={() => setPersonaje(p.id)}
            className={cn(
              "grid size-20 place-items-center rounded-tarjeta border-2 bg-hundido",
              personaje === p.id ? "border-naranja" : "border-transparent",
            )}
          >
            <MascotaAvatar personaje={p.id} tamano={64} />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-hundido">
          <MascotaAvatar personaje={personaje} foto={foto} tamano={foto ? 64 : 56} />
        </span>
        <div className="flex flex-wrap gap-2">
          <Boton variante="secundario" className="min-h-11 px-4 text-cuerpo" onClick={() => entradaFoto.current?.click()}>
            {foto ? "Cambiar foto" : "Agregar foto"}
          </Boton>
          {foto && (
            <Boton variante="fantasma" className="min-h-11 px-3 text-cuerpo" onClick={() => setFoto(undefined)}>
              Quitar
            </Boton>
          )}
        </div>
        <input
          ref={entradaFoto}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            const r = await reducirFoto(f);
            if (r.ok) {
              setFoto(r.foto);
              setErrorFoto("");
            } else setErrorFoto(r.error);
          }}
        />
      </div>
      {(errorFoto || errores.foto) && (
        <p role="alert" className="text-cuerpo font-bold text-error">
          {errorFoto || errores.foto}
        </p>
      )}
      <Campo etiqueta="Nombre" value={nombre} maxLength={24} error={errores.nombre} onChange={(e) => setNombre(e.target.value)} />
      <Campo etiqueta="Raza o tipo" value={raza} maxLength={40} error={errores.raza} onChange={(e) => setRaza(e.target.value)} />
      <Selector etiqueta="País" value={pais} onChange={(e) => setPais(e.target.value as CodigoPais)}>
        {PAISES.map((p) => (
          <option key={p.codigo} value={p.codigo}>
            {p.nombre}
          </option>
        ))}
      </Selector>
      <Campo
        etiqueta="Fecha de nacimiento"
        type="date"
        value={nacimiento}
        max={hoy}
        error={errores.nacimiento}
        onChange={(e) => setNacimiento(e.target.value)}
      />
      <label className="flex min-h-11 items-center gap-3 text-cuerpo font-bold">
        <input type="checkbox" checked={aproximada} onChange={(e) => setAproximada(e.target.checked)} className="size-5 accent-tinta" />
        Es una fecha aproximada
      </label>
      <Selector etiqueta="Cuidado prioritario" value={prioridad} onChange={(e) => setPrioridad(e.target.value as Prioridad)}>
        {PRIORIDADES.map((p) => (
          <option key={p} value={p}>
            {ETIQUETA_PRIORIDAD[p]}
          </option>
        ))}
      </Selector>
      <Boton type="submit">Guardar cambios</Boton>
    </form>
  );
}

export default function Mascotas() {
  const router = useRouter();
  const { estado, hoy, despachar } = useHuellas();
  const [editando, setEditando] = useState<Mascota | null>(null);
  const [borrando, setBorrando] = useState<Mascota | null>(null);
  const [limite, setLimite] = useState(false);

  if (estado.mascotas.length === 0) return <SinMascota />;
  const maximo = limiteDeMascotas(planVigente(estado, hoy));

  return (
    <Escalonado className="flex flex-col gap-6">
      <Aparece className="flex items-start justify-between gap-3">
        <div>
          <p className="text-etiqueta font-black tracking-wider text-suave-texto">MASCOTAS</p>
          <h1 className="text-display font-black tracking-tight">Tu familia</h1>
        </div>
      </Aparece>

      <Aparece className="flex flex-col gap-3">
        {estado.mascotas.map((m) => {
          const activa = m.id === estado.mascotaActivaId;
          return (
            <article key={m.id} className={cn("rounded-tarjeta border-2 bg-papel p-4", activa ? "border-naranja" : "border-linea")}>
              <div className="flex items-center gap-4">
                <span className="grid size-20 shrink-0 place-items-center rounded-tarjeta bg-hundido">
                  <MascotaAvatar personaje={m.personaje} foto={m.foto} tamano={m.foto ? 80 : 72} className={m.foto ? "" : undefined} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-titulo font-black">{m.nombre}</h2>
                  <p className="text-cuerpo text-suave-texto">
                    {ETIQUETA_ESPECIE[m.especie]} · {razaOMestizo(m)} · {describirEdad(m, hoy)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activa && <Chip tono="naranja">Activa</Chip>}
                    {m.origen === "demo" && <Chip>DEMO</Chip>}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Boton
                  className="min-h-11 flex-1 px-4 text-cuerpo"
                  onClick={() => {
                    despachar({ tipo: "mascota/activar", id: m.id });
                    router.push("/app/carnet");
                  }}
                >
                  Ver carnet
                </Boton>
                <button
                  type="button"
                  aria-label={`Editar a ${m.nombre}`}
                  onClick={() => setEditando(m)}
                  className="grid size-11 place-items-center rounded-control bg-hundido"
                >
                  <Pencil aria-hidden className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label={`Eliminar a ${m.nombre}`}
                  onClick={() => setBorrando(m)}
                  className="grid size-11 place-items-center rounded-control bg-hundido text-error"
                >
                  <Trash2 aria-hidden className="size-5" />
                </button>
              </div>
            </article>
          );
        })}
      </Aparece>

      <Aparece>
        {puedeAgregarMascota(estado, hoy) ? (
          <BotonLink href="/app/mascotas/nueva" variante="secundario">
            <Plus aria-hidden className="size-5" />
            Agregar otra mascota
          </BotonLink>
        ) : (
          <Boton variante="secundario" onClick={() => setLimite(true)}>
            <Plus aria-hidden className="size-5" />
            Agregar otra mascota
          </Boton>
        )}
      </Aparece>

      <Hoja abierta={editando !== null} titulo={`Editar a ${editando?.nombre ?? ""}`} alCerrar={() => setEditando(null)}>
        {editando && (
          <FormularioEdicion
            mascota={editando}
            hoy={hoy}
            alGuardar={(m) => {
              despachar({
                tipo: "mascota/editar",
                id: m.id,
                cambios: {
                  nombre: m.nombre,
                  raza: m.raza,
                  pais: m.pais,
                  nacimiento: m.nacimiento,
                  nacimientoAproximado: m.nacimientoAproximado,
                  prioridad: m.prioridad,
                  personaje: m.personaje,
                  foto: m.foto,
                },
              });
              setEditando(null);
            }}
          />
        )}
      </Hoja>

      <Hoja abierta={borrando !== null} titulo={`¿Eliminar a ${borrando?.nombre ?? ""}?`} alCerrar={() => setBorrando(null)}>
        <p className="text-cuerpo text-suave-texto">
          Se borran su carnet, sus registros y sus cuidados programados de este dispositivo. No se puede deshacer. Si quieres conservarlos,
          descarga tus datos desde Perfil antes.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Boton
            variante="peligro"
            onClick={() => {
              if (borrando) despachar({ tipo: "mascota/eliminar", id: borrando.id });
              setBorrando(null);
            }}
          >
            Eliminar mascota
          </Boton>
          <Boton variante="secundario" onClick={() => setBorrando(null)}>
            Cancelar
          </Boton>
        </div>
      </Hoja>

      <Hoja abierta={limite} titulo="Llegaste al límite de tu plan" alCerrar={() => setLimite(false)}>
        <Aviso tono="aviso">
          Tu plan permite {maximo} {maximo === 1 ? "mascota propia" : "mascotas propias"}. Tus datos siguen disponibles; solo no se pueden
          agregar más.
        </Aviso>
        <div className="mt-6 flex flex-col gap-3">
          <BotonLink href="/paywall">Ver planes</BotonLink>
          <Boton variante="secundario" onClick={() => setLimite(false)}>
            Cerrar
          </Boton>
        </div>
      </Hoja>
    </Escalonado>
  );
}
