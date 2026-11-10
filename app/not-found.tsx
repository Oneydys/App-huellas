import type { Metadata } from "next";
import { Marco } from "@/components/marco";
import { BotonLink } from "@/components/ui/boton";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NoEncontrada() {
  return (
    <Marco className="items-center justify-center text-center">
      <h1 className="text-titulo font-black">No encontramos esta página</h1>
      <p className="mt-2 max-w-xs text-cuerpo text-suave-texto">Puede que el enlace esté incompleto. Tus datos están a salvo.</p>
      <BotonLink href="/" className="mt-6 w-full">
        Ir al inicio
      </BotonLink>
    </Marco>
  );
}
