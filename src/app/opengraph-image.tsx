import { ImageResponse } from "next/og";

export const alt = "Academia de Fútbol Huachipato — Filial Talca";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#09090f",
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(41,82,200,0.18) 0 80px, transparent 80px 160px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#6a8ee0",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Club Deportivo Huachipato
        </div>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            color: "#ffffff",
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          <span>Academia de Fútbol</span>
          <span>Filial Talca</span>
        </div>
        <div
          style={{
            marginTop: 28,
            color: "rgba(255,255,255,0.6)",
            fontSize: 30,
          }}
        >
          Formamos deportistas, forjamos personas.
        </div>
      </div>
    ),
    size,
  );
}
