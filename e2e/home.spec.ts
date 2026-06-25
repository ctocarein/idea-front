import { expect, test } from "@playwright/test";

/** Parcours critique : accueil → diagnostic → bilan (flow A). */
test("l'accueil mène au diagnostic et produit un bilan", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /sais défendre/i }),
  ).toBeVisible();

  await page.getByRole("link", { name: /lancer mon diagnostic/i }).first().click();
  await expect(page).toHaveURL(/\/diagnostic/);

  // Flow A : écrire mon idée
  await page.getByRole("button", { name: /écrire mon idée/i }).click();
  await page.getByPlaceholder(/AgriConnect/i).fill("Mon projet test");
  await page.getByRole("button", { name: /^Agritech$/ }).click();
  await page.getByRole("button", { name: /continuer/i }).click();

  await page.getByPlaceholder(/Mon projet aide/i).fill(
    "Mon projet aide les agriculteurs à mieux vendre leurs récoltes.",
  );
  await page.getByRole("button", { name: /continuer/i }).click();

  await page.getByLabel(/RGPD/i).check();
  await page.getByRole("button", { name: /voir mon bilan/i }).click();

  await expect(
    page.getByRole("heading", { name: /tableau de compréhension/i }),
  ).toBeVisible();
});
