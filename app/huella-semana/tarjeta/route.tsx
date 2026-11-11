import { ImageResponse } from "next/og";
import { COLOR_OG, fuentesOg, leerFuente, leerMascota, mascotaOg } from "@/lib/og";
import { HUELLA_SEMANA } from "@/lib/huella-semana";

// Tarjeta 4:5 (1080×1350) de «Mi huella de la semana». Es genérica: no recibe parámetros ni datos.
export async function GET() {
  const [f700, f900, png] = await Promise.all([
    leerFuente("nunito-700.woff"),
    leerFuente("nunito-900.woff"),
    leerMascota(),
  ]);
  const fuentes = fuentesOg(f700, f900);
  const mascota = mascotaOg(png);

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: 60, background: COLOR_OG.fondo, fontFamily: "Nunito" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", borderRadius: 64, background: COLOR_OG.papel }}>
          <div
            style={{
              display: "flex",
              height: 700,
              padding: "64px 56px 0",
              background: `linear-gradient(160deg, ${COLOR_OG.naranjaClaro}, ${COLOR_OG.naranjaHondo})`,
              color: COLOR_OG.tinta,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", width: 500 }}>
              <div style={{ display: "flex", fontSize: 30, fontWeight: 900, letterSpacing: 3 }}>PELUVET</div>
              <div style={{ display: "flex", marginTop: 28, fontSize: 100, fontWeight: 900, lineHeight: 1.04 }}>{HUELLA_SEMANA.titulo}</div>
            </div>
            <div style={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- next/og no usa next/image */}
              <img alt="" src={mascota} width={340} height={286} style={{ width: 340, height: 286 }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "64px 56px 56px" }}>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 900, lineHeight: 1.12, color: COLOR_OG.tinta }}>Cuidar también es constancia.</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: "auto", gap: 24 }}>
              <svg width="72" height="72" viewBox="0 0 120 120" style={{ display: "flex" }}>
                <ellipse cx="60" cy="78" rx="22" ry="18" fill={COLOR_OG.naranja} />
                <ellipse cx="32" cy="52" rx="9" ry="12" fill={COLOR_OG.naranja} />
                <ellipse cx="52" cy="38" rx="9" ry="12" fill={COLOR_OG.naranja} />
                <ellipse cx="74" cy="38" rx="9" ry="12" fill={COLOR_OG.naranja} />
                <ellipse cx="94" cy="52" rx="9" ry="12" fill={COLOR_OG.naranja} />
              </svg>
              <div style={{ display: "flex", flex: 1, fontSize: 28, fontWeight: 700, lineHeight: 1.35, color: COLOR_OG.suave }}>{HUELLA_SEMANA.pie}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts: fuentes },
  );
}
