import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Build autonome pour la containerisation (image légère, `node server.js`).
  output: "standalone",
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
