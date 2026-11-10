"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import { CodigoQr } from "@/components/codigo-qr";
import { SelectorMascota } from "@/components/selector-mascota";
import { SinMascota } from "@/components/sin-mascota";
import { useAvisos } from "@/components/toast";
import { Aviso } from "@/components/ui/aviso";
import { Aparece, Escalonado } from "@/components/ui/aparece";
import { Boton } from "@/components/ui/boton";
import { Campo } from "@/components/ui/campo";
import { MascotaAvatar } from "@/components/ui/mascota-avatar";
import { codigoMascota, contactoSchema, razaOMestizo, type Contacto, type Mascota } from "@/lib/mascota";
import { ETIQUETA_ESPECIE } from "@/lib/personajes";
import { datosDeIdentificacion } from "@/lib/qr";
import { useHuellas } from "@/lib/store/hooks";

function Formulario({ mascota, alCambiar }: { mascota: Mascota; alCambiar: (c: Contacto) => void }) {
  const { despachar } = useHuellas();
  const { mostrar } = useAvisos();
  const [c, setC] = useState<Contacto>(mascota.contacto ?? { nombre: "", telefono: "", nota: "" });
  const [errores, setErrores] = useState<Record<string, string>>({});

  const poner = (campo: keyof Contacto) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const siguiente = { ...c, [campo]: e.target.value };
    setC(siguiente);
    alCambiar(siguiente);
    setErrores((prev) => ({ ...prev, [campo]: "" }));
  };

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const r = contactoSchema.safeParse(c);
    if (!r.success) {
      const errs: Record<string, string> = {};
      for (const i of r.error.issues) errs[String(i.path[0])] ??= i.message;
      return setErrores(errs);
    }
    if (!r.data.telefono) return setErrores({ telefono: "Escribe un teléfono para que puedan llamarte." });
    despachar({ tipo: "mascota/editar", id: mascota.id, cambios: { contacto: r.data } });
    mostrar("Contacto guardado en este dispositivo.");
  }

  return (
    <form onSubmit={guardar} noValidate className="no-imprimir flex flex-col gap-4">
      <Campo etiqueta="Tu nombre" value={c.nombre} maxLength={60} autoComplete="name" error={errores.nombre} onChange={poner("nombre")} />
      <Campo
        etiqueta="Teléfono de contacto"
        type="tel"
        inputMode="tel"
        value={c.telefono}
        maxLength={30}
        autoComplete="tel"
        placeholder="Incluye el código del país, por ejemplo +52 55 1234 5678"
        error={errores.telefono}
        onChange={poner("telefono")}
      />
      <Campo
        etiqueta="Nota corta (opcional)"
        value={c.nota}
        maxLength={140}
        placeholder="Ejemplo: es tímida, responde a su nombre"
        error={errores.nota}
        onChange={poner("nota")}
      />
      <Boton type="submit" variante="secundario">
        Guardar contacto
      </Boton>
    </form>
  );
}

export default function Perdida() {
  const { mascota } = useHuellas();
  const [borrador, setBorrador] = useState<Contacto | null>(null);
  if (!mascota) return <SinMascota />;

  const contacto = borrador ?? mascota.contacto ?? { nombre: "", telefono: "", nota: "" };

  return (
    <Escalonado className="flex flex-col gap-6">
      <Aparece className="no-imprimir flex flex-col gap-4">
        <SelectorMascota />
        <div>
          <p className="text-etiqueta font-black tracking-wider text-suave-texto">CARNET</p>
          <h1 className="text-display font-black tracking-tight">Tarjeta de mascota perdida</h1>
        </div>
        <Aviso>Imprímela y llévala en su collar o en tu cartera. Quien la encuentre puede escanear el código o llamar al teléfono impreso.</Aviso>
      </Aparece>

      <Aparece>
        <Formulario key={mascota.id} mascota={mascota} alCambiar={setBorrador} />
      </Aparece>

      <Aparece>
        <section
          aria-label={`Tarjeta de mascota perdida de ${mascota.nombre}`}
          className="tarjeta-perdida mx-auto w-full max-w-sm overflow-hidden rounded-tarjeta border-2 border-tinta bg-papel text-tinta shadow-calida"
        >
          <header className="bg-naranja px-6 py-4 text-center">
            <p className="text-titulo font-black tracking-wide">¿ME PERDÍ?</p>
            <p className="text-cuerpo font-bold">Por favor, ayúdame a volver a casa</p>
          </header>
          <div className="flex flex-col items-center gap-3 px-6 py-6 text-center">
            <div className="grid size-28 place-items-center overflow-hidden rounded-full border-4 border-naranja bg-hundido">
              <MascotaAvatar personaje={mascota.personaje} foto={mascota.foto} tamano={mascota.foto ? 112 : 104} />
            </div>
            <h2 className="break-words text-display font-black">Me llamo {mascota.nombre}</h2>
            <p className="text-cuerpo font-bold">
              {ETIQUETA_ESPECIE[mascota.especie]} · {razaOMestizo(mascota)}
            </p>
            {contacto.nota && <p className="text-cuerpo">{contacto.nota}</p>}
            <div className="mt-2 w-full rounded-control bg-hundido p-4">
              <p className="text-cuerpo font-bold">Llama a {contacto.nombre || "mi familia"}</p>
              <p className="break-words text-titulo font-black tabular-nums">{contacto.telefono || "Escribe un teléfono arriba"}</p>
            </div>
            <div className="mt-2 flex flex-col items-center gap-2">
              <CodigoQr
                codigo={codigoMascota(mascota.id)}
                datos={datosDeIdentificacion(mascota)}
                etiqueta={`Código QR de ${mascota.nombre}`}
                className="size-32"
              />
              <p className="text-cuerpo font-bold">Escanéalo para ver su nombre y su especie.</p>
            </div>
          </div>
        </section>
      </Aparece>

      <Aparece className="no-imprimir">
        <Boton onClick={() => window.print()} className="w-full">
          <Printer aria-hidden className="size-5" />
          Imprimir la tarjeta
        </Boton>
      </Aparece>
    </Escalonado>
  );
}
