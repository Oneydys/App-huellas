import { ImageResponse } from "next/og";
import { COLOR_OG, fuentesOg, leerEmblema, leerFuente, leerMascota, mascotaOg } from "@/lib/og";
import { PLANTILLA } from "@/lib/plantilla";

// Vista previa de los enlaces (1200×630): marca, eslogan y el personaje. No incluye datos de nadie.
export const alt = `${PLANTILLA.nombreApp}: carnet de salud para tu perro o gato`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ImagenDeEnlace() {
  const [f700, f900, png, emblema] = await Promise.all([
    leerFuente("nunito-700.woff"),
    leerFuente("nunito-900.woff"),
    leerMascota(),
    leerEmblema(),
  ]);
  const fuentes = fuentesOg(f700, f900);
  const mascota = mascotaOg(png);
  const logo = mascotaOg(emblema);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 48,
          background: `linear-gradient(135deg, ${COLOR_OG.naranjaClaro}, ${COLOR_OG.naranjaHondo})`,
          color: COLOR_OG.tinta,
          fontFamily: "Nunito",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, paddingLeft: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img alt="" src={logo} width={64} height={64} style={{ width: 64, height: 64 }} />
            <div style={{ display: "flex", fontSize: 28, fontWeight: 900, letterSpacing: 3 }}>{PLANTILLA.nombreApp.toUpperCase()}</div>
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 68, fontWeight: 900, lineHeight: 1.08 }}>
            Ten a la vista qué le toca a tu mascota y cuándo
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 30, fontWeight: 700 }}>Carnet de salud para perros y gatos</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 400 }}>
          <img alt="" src={mascota} width={360} height={303} style={{ width: 360, height: 303 }} />
        </div>
      </div>
    ),
    { ...size, fonts: fuentes },
  );
}
