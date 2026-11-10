"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Marco } from "@/components/marco";
import { Aviso } from "@/components/ui/aviso";
import { Boton } from "@/components/ui/boton";
import { Campo } from "@/components/ui/campo";
import { PantallaCargando } from "@/components/ui/esqueleto";
import { Logotipo, MascotaAvatar } from "@/components/ui/mascota-avatar";
import { NavLegal } from "@/components/nav-legal";
import { avisosDePlantilla } from "@/lib/plantilla";
import { solicitarAcceso } from "@/lib/servicios";
import { useRequiereMascota } from "@/lib/store/guardias";
import { useHuellas } from "@/lib/store/hooks";

export default function Acceso() {
  useRequiereMascota();
  const router = useRouter();
  const { listo, mascota, despachar } = useHuellas();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [enCurso, setEnCurso] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEnCurso(true);
    const r = await solicitarAcceso(correo);
    if (!r.ok) {
      setError(r.error);
      setEnCurso(false);
      return;
    }
    despachar({ tipo: "acceso/iniciar" });
    router.push("/app");
  }

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
          <div className="mt-6 flex items-center gap-4 rounded-tarjeta bg-gradient-to-br from-naranja-claro to-naranja-hondo p-4 text-tinta">
            <MascotaAvatar personaje={mascota.personaje} tamano={96} priority />
            <div>
              <p className="text-etiqueta font-black tracking-wider">EL CARNET DE</p>
              <p className="text-titulo font-black">{mascota.nombre}</p>
            </div>
          </div>
          <h1 className="mt-6 text-display font-black tracking-tight">Entra al carnet de {mascota.nombre}</h1>
          <p className="mt-2 text-cuerpo text-suave-texto">
            Escribe tu correo para entrar al carnet.
          </p>
          <form onSubmit={enviar} noValidate className="mt-6 flex flex-col gap-4">
            <Campo
              etiqueta="Tu correo"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nombre@correo.com"
              value={correo}
              error={error}
              onChange={(e) => {
                setCorreo(e.target.value);
                setError("");
              }}
            />
            <Boton type="submit" disabled={enCurso}>
              {enCurso ? "Entrando…" : "Entrar a la app"}
            </Boton>
          </form>
          {avisosDePlantilla && (
            <Aviso className="mt-6">
              Acceso simulado: no crea cuentas ni envía o guarda tu correo. Los datos quedan en este dispositivo.
            </Aviso>
          )}
        </>
      )}
      <NavLegal prefijo="Al continuar aceptas" className="mt-10" />
    </Marco>
  );
}
