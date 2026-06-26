import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autonome pour la containerisation (image légère, `node server.js`).
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
