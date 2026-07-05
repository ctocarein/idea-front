import { ImageResponse } from "next/og";

/** Favicon / icône PWA de marque (corail + barre « étincelle » blanche). */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ea5a2c",
          borderRadius: 104,
        }}
      >
        <div style={{ width: 96, height: 300, background: "#fff", borderRadius: 999 }} />
      </div>
    ),
    size,
  );
}
