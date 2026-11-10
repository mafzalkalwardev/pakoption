import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export const OG_ALT =
  "PakOption — inspection-backed car auctions in Pakistan, made by INDUS Web Agency";

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#04140E",
          color: "#F4F7F5",
          padding: "68px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "#0A2119",
              border: "2px solid #12B76A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2DD48A",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            P
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>
            PakOption
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 980,
            }}
          >
            Inspection-backed car auctions for Pakistan
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 28,
              lineHeight: 1.35,
              color: "#8FA69A",
              maxWidth: 900,
            }}
          >
            Proxy bidding, a hidden reserve, a three-minute soft close, and
            inspection reports on the lot.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
          }}
        >
          <div style={{ display: "flex", color: "#2DD48A" }}>
            pakoption.induswebagency.com
          </div>
          <div style={{ display: "flex", color: "#8FA69A" }}>
            Made by INDUS Web Agency
          </div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}

export function renderIcon(size: number) {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.46);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#04140E",
          color: "#2DD48A",
          fontSize,
          fontWeight: 700,
          borderRadius: radius,
        }}
      >
        P
      </div>
    ),
    { width: size, height: size },
  );
}
