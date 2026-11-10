"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AsistenteMascota } from "@/components/asistente-mascota";
import { Aviso } from "@/components/ui/aviso";
import { BotonLink } from "@/components/ui/boton";
import { limiteDeMascotas } from "@/lib/plantilla";
import { planVigente, puedeAgregarMascota } from "@/lib/store/selectores";
import { useHuellas } from "@/lib/store/hooks";

export default function NuevaMascota() {
  const router = useRouter();
  const { estado, hoy } = useHuellas();

  if (!puedeAgregarMascota(estado, hoy)) {
    const limite = limiteDeMascotas(planVigente(estado, hoy));
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-titulo font-black">Llegaste al límite de tu plan</h1>
        <Aviso tono="aviso">
          Tu plan permite {limite} {limite === 1 ? "mascota propia" : "mascotas propias"}. Tus datos siguen disponibles; solo no se pueden
          agregar más.
        </Aviso>
        <BotonLink href="/paywall">Ver planes</BotonLink>
        <BotonLink href="/app/mascotas" variante="secundario">
          Volver a mis mascotas
        </BotonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-2 flex justify-end">
        <Link href="/app/mascotas" className="inline-flex min-h-11 items-center text-cuerpo font-black text-suave-texto underline underline-offset-4">
          Cancelar
        </Link>
      </div>
      <AsistenteMascota modo="agregar" alTerminar={() => router.push("/app")} />
    </div>
  );
}
