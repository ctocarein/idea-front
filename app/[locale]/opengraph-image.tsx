import { ImageResponse } from "next/og";

import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";

/** Image Open Graph de marque (1200×630), localisée — aperçu des partages sociaux. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ideaxion";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });
  const tagline = locale === "en" ? "Become capable and confident." : "Deviens capable et confiant.";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1E1B3A 0%, #2D2352 55%, #3A2A5E 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 22,
              height: 64,
              borderRadius: 6,
              background: "linear-gradient(180deg, #FF7A5C 0%, #FF5C7A 100%)",
            }}
          />
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 2, color: "#F4B393" }}>
            IDEAXION
          </div>
        </div>
        <div style={{ marginTop: 40, fontSize: 68, fontWeight: 800, lineHeight: 1.1, maxWidth: 960 }}>
          {tagline}
        </div>
        <div style={{ marginTop: 32, fontSize: 30, color: "#C9C2E8", maxWidth: 940, lineHeight: 1.35 }}>
          {t("default.description")}
        </div>
      </div>
    ),
    size,
  );
}
