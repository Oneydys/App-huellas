"use client";

import { useRouter } from "next/navigation";
import { AsistenteMascota } from "@/components/asistente-mascota";
import { Marco } from "@/components/marco";
import { NavLegal } from "@/components/nav-legal";
import { Logotipo } from "@/components/ui/mascota-avatar";

export default function Onboarding() {
  const router = useRouter();
  return (
    <Marco>
      <header className="mb-2">
        <Logotipo />
      </header>
      <AsistenteMascota modo="inicial" alTerminar={() => router.push("/paywall")} />
      <NavLegal prefijo="Al continuar aceptas" className="mt-10" />
    </Marco>
  );
}
