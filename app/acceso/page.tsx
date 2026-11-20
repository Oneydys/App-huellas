"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Marco } from "@/components/marco";
import { Aviso } from "@/components/ui/aviso";
import { Boton } from "@/components/ui/boton";
import { Campo } from "@/components/ui/campo";
import { PantallaCargando } from "@/components/ui/esqueleto";
import { MarcoFoto } from "@/components/marco-foto";
import { Logotipo } from "@/components/ui/mascota-avatar";
import { NavLegal } from "@/components/nav-legal";
import { personajePorId } from "@/lib/personajes";
import { avisosDePlantilla } from "@/lib/plantilla";
import { accesoRealConfigurado, iniciarSesionConContrasena, solicitarAcceso } from "@/lib/servicios";
import { useHuellas } from "@/lib/store/hooks";

export default function Acceso() {
  const router = useRouter();
  const { listo, mascota, despachar } = useHuellas();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [enCurso, setEnCurso] = useState(false);
  // Demostración solo sin Supabase. Mientras no se sabe el estado, el botón queda oculto.
  const [demoDisponible, setDemoDisponible] = useState(false);

  useEffect(() => {
    let vigente = true;
    accesoRealConfigurado().then((configurado) => {
      if (vigente) setDemoDisponible(!configurado);
    });
    return () => {
      vigente = false;
    };
  }, []);

  async function enviar() {
    setError("");
    setEnCurso(true);
    const r = await solicitarAcceso(correo);
    if (!r.ok) {
      setError(r.error);
      setEnCurso(false);
      return;
    }
    despachar({ tipo: "acceso/iniciar" });
    router.push("/demo");
  }

  async function entrarConContrasena(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEnCurso(true);
    const r = await iniciarSesionConContrasena(correo, contrasena);
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
      {!listo ? (
        <div className="mt-6">
          <PantallaCargando />
        </div>
      ) : (
        <>
          {mascota && (
          <div className="mt-6 flex items-center gap-4 rounded-tarjeta bg-gradient-to-br from-naranja-claro to-naranja-hondo p-4 text-tinta">
            {/* Con o sin foto propia, la mascota va dentro del mismo marco del carnet. */}
            <div className="w-24 shrink-0">
              <MarcoFoto
                src={mascota.foto ?? personajePorId(mascota.personaje).imagen}
                alt={mascota.foto ? `Foto de ${mascota.nombre}` : `Dibujo de ${mascota.nombre}`}
                sizes="96px"
                priority
              />
            </div>
            <div>
              <p className="text-etiqueta font-black tracking-wider">EL CARNET DE</p>
              <p className="text-titulo font-black">{mascota.nombre}</p>
            </div>
          </div>
          )}
          <h1 className="mt-6 text-display font-black tracking-tight">
            {mascota ? `Entra al carnet de ${mascota.nombre}` : "Entra a tu cuenta de Peluvet"}
          </h1>
          <p className="mt-2 text-cuerpo text-suave-texto">
            {mascota ? "Escribe tu correo para entrar al carnet." : "Escribe tu correo y tu contraseña para entrar."}
          </p>
          <form onSubmit={entrarConContrasena} noValidate className="mt-6 flex flex-col gap-4">
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
            <Campo
              etiqueta="Tu contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={contrasena}
              error={error}
              onChange={(e) => {
                setContrasena(e.target.value);
                setError("");
              }}
            />
            <Boton type="submit" disabled={enCurso}>
              {enCurso ? "Entrando…" : "Entrar con contraseña"}
            </Boton>
            {demoDisponible && (
              <Boton type="button" variante="secundario" disabled={enCurso} onClick={() => enviar()}>
                Entrar a la app
              </Boton>
            )}
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
