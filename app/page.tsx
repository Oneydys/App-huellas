import { CalendarDays, Check, FileText, IdCard } from "lucide-react";
import Link from "next/link";
import { AccionesInicio, CtaPrincipal } from "@/components/acciones-inicio";
import { BarraCtaFija } from "@/components/barra-cta-fija";
import { HeroeCarnet } from "@/components/heroe-carnet";
import { Marco } from "@/components/marco";
import { MarcoTelefono } from "@/components/marco-telefono";
import { Aviso } from "@/components/ui/aviso";
import { Logotipo } from "@/components/ui/mascota-avatar";
import { avisosDePlantilla, formatearPrecio, PLANTILLA, textoGarantia } from "@/lib/plantilla";

const VALORES = [
  {
    icono: CalendarDays,
    titulo: "Calendario Vivo",
    texto: "El Calendario Vivo propone próximas fechas según su edad y tus registros; son orientativas.",
  },
  { icono: IdCard, titulo: "Carnet siempre a mano", texto: "Vacunas, peso y visitas en una sola línea de tiempo." },
  { icono: FileText, titulo: "Resumen para el veterinario", texto: "Lleva su historial ordenado a la consulta." },
] as const;

// Objeciones reales de quien compra. Las cifras salen de la configuración: si cambias precios o garantía, cambian aquí.
const PREGUNTAS = [
  {
    pregunta: "¿Cuánto cuesta?",
    respuesta: `El plan gratis incluye una mascota y no vence. Pro suma hasta ${PLANTILLA.limites.mascotasPro} mascotas: ${formatearPrecio(PLANTILLA.precios.mensual)} al mes o ${formatearPrecio(PLANTILLA.precios.anual)} al año.`,
  },
  {
    pregunta: "¿Mis datos son privados?",
    respuesta:
      "Se guardan en tu navegador. Esta demostración no los envía a ningún servidor, y puedes descargar una copia desde Perfil cuando quieras.",
  },
  {
    pregunta: "¿Y si pido un reembolso?",
    respuesta: `Garantía de ${PLANTILLA.garantia.garantiaDias} días: la solicitud de reembolso dentro de ese plazo se gestiona con Hotmart. Tus datos siguen en tu navegador.`,
  },
  {
    pregunta: "¿Sirve si nunca he llevado un registro?",
    respuesta: "Sí. Solo anotas vacunas, peso y visitas, y la app ordena las fechas. No diagnostica ni reemplaza a tu veterinario.",
  },
] as const;

const CAPTURAS = [
  { src: "/images/capturas/inicio.png", titulo: "Inicio", texto: "Su próximo cuidado, siempre al frente.", alt: "Pantalla de inicio de Peluvet con el carnet de Luna y su próximo cuidado" },
  { src: "/images/capturas/calendario.png", titulo: "Calendario", texto: "Qué toca, qué viene y qué ya pasó.", alt: "Calendario de cuidados de Luna con próximas fechas" },
  { src: "/images/capturas/carnet.png", titulo: "Carnet", texto: "Su carnet digital, listo para compartir.", alt: "Carnet digital de Luna con foto, datos y estado de vacunas" },
] as const;

export default function Portada() {
  const { precios } = PLANTILLA;
  return (
    <Marco className="pb-28 md:max-w-4xl">
      <header className="flex items-center justify-between">
        <Logotipo />
      </header>

      {/* Cabecera: texto y CTA. El carnet con la captura real va bajo el CTA en móvil y a la derecha desde 768 px. */}
      <section className="mt-6 md:grid md:grid-cols-2 md:items-center md:gap-8">
        <div className="flex flex-col gap-6">
          <div className="rounded-tarjeta bg-gradient-to-br from-naranja-claro to-naranja-hondo p-6 text-tinta md:p-8">
            <p className="text-etiqueta font-black tracking-wider">CARNET DE SALUD PARA PERROS Y GATOS</p>
            <h1 className="mt-3 text-heroe font-black tracking-tight">Sus cuidados, a la vista</h1>
            <p className="mt-3 text-cuerpo font-bold">
              Guarda vacunas, peso y visitas. Consulta sus próximas fechas de cuidado.
            </p>
          </div>
          <div id="cta-principal">
            <AccionesInicio />
            <p className="mt-3 text-center text-cuerpo text-suave-texto">{textoGarantia()}</p>
          </div>
        </div>
        <HeroeCarnet className="mt-10 md:mt-0" />
      </section>

      <section aria-labelledby="como-se-ve" className="mt-10">
        <h2 id="como-se-ve" className="text-titulo font-black">
          Así se ve por dentro
        </h2>
        <p className="mt-1 text-cuerpo text-suave-texto">Datos de ejemplo</p>
        <ul
          tabIndex={0}
          aria-label="Capturas de la app, desliza para ver más"
          className="sin-barra -mx-6 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2"
        >
          {CAPTURAS.map((c) => (
            <li key={c.src} className="flex w-56 shrink-0 snap-center flex-col gap-2">
              <MarcoTelefono src={c.src} alt={c.alt} />
              <p className="text-cuerpo font-black">{c.titulo}</p>
              <p className="-mt-2 text-cuerpo text-suave-texto">{c.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="que-hace" className="mt-10">
        <h2 id="que-hace" className="text-titulo font-black">
          Tres cosas, bien hechas
        </h2>
        <ul className="mt-4 flex flex-col gap-4">
          {VALORES.map(({ icono: Icono, titulo, texto }) => (
            <li key={titulo} className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-control bg-hundido text-naranja">
                <Icono aria-hidden className="size-5" />
              </span>
              <div>
                <h3 className="text-cuerpo font-black">{titulo}</h3>
                <p className="text-cuerpo text-suave-texto">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 md:mx-auto md:max-w-sm">
        <CtaPrincipal id="cta-inicio-medio" />
        <p className="mt-3 text-center text-cuerpo text-suave-texto">{textoGarantia()}</p>
      </div>

      <section aria-labelledby="gratis" className="mt-10 rounded-tarjeta bg-hundido p-4">
        <h2 id="gratis" className="text-titulo font-black">
          Lo esencial es gratis.
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {PLANTILLA.siempreGratis.map((t) => (
            <li key={t} className="flex items-start gap-2 text-cuerpo">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-exito" />
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-cuerpo">
          <strong>Pro</strong> suma más mascotas. Desde {formatearPrecio(precios.anual / 12)} al mes con plan anual ({formatearPrecio(precios.anual)})
          {precios.diasPrueba > 0 && ` y ${precios.diasPrueba} días de prueba`}.
        </p>
      </section>

      <section aria-labelledby="preguntas" className="mt-10">
        <h2 id="preguntas" className="text-titulo font-black">
          Preguntas frecuentes
        </h2>
        <div className="mt-4 flex flex-col gap-5">
          {PREGUNTAS.map((p) => (
            <div key={p.pregunta}>
              <h3 className="text-cuerpo font-black">{p.pregunta}</h3>
              <p className="mt-1 text-cuerpo text-suave-texto">{p.respuesta}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 md:mx-auto md:max-w-sm">
        <CtaPrincipal id="cta-inicio-final" />
        <p className="mt-3 text-center text-cuerpo text-suave-texto">{textoGarantia()}</p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {avisosDePlantilla && <Aviso>{PLANTILLA.textos.avisoSimulacion}</Aviso>}
        <Aviso>{PLANTILLA.textos.avisoNoVeterinario}</Aviso>
      </div>

      <nav
        aria-label="Legal"
        className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-1 text-cuerpo font-bold text-suave-texto"
      >
        <Link href="/legal/privacidad" className="inline-flex min-h-11 min-w-11 items-center justify-center underline-offset-4 hover:underline">
          Privacidad
        </Link>
        <Link href="/legal/terminos" className="inline-flex min-h-11 min-w-11 items-center justify-center underline-offset-4 hover:underline">
          Términos
        </Link>
        <Link href="/legal/cookies" className="inline-flex min-h-11 min-w-11 items-center justify-center underline-offset-4 hover:underline">
          Cookies
        </Link>
      </nav>

      <BarraCtaFija observar="cta-principal" />
    </Marco>
  );
}
