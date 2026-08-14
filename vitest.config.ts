import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Le pool `forks` (défaut) n'arrive pas à démarrer ses workers sous Windows :
    // `pnpm test` échouait en timeout au lieu de tourner. `threads` fonctionne
    // partout et évite d'avoir une suite de tests injouable en local.
    pool: "threads",
  },
});
