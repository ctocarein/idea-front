import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright — parcours critiques (OPS-01, CAHIER_RECETTE). Mobile-first :
 * on teste d'abord un viewport mobile.
 *
 * Lancer : `pnpm exec playwright install` (une fois) puis `pnpm e2e`.
 * Le webServer démarre l'app automatiquement.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
