import { Nunito } from "next/font/google";

/**
 * Nunito (variable, pesos 200 a 1000) para toda la app. Next la descarga en el build y la sirve desde el mismo
 * dominio: el navegador no pide nada a Google. Se aplica en app/layout.tsx y app/global-error.tsx.
 */
export const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
