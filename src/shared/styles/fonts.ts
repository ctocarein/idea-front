import { Bricolage_Grotesque, Inter } from "next/font/google";

/**
 * Typographie « Aube » (CHARTE_FRONTEND.md §1.3) — chargée via next/font
 * (self-host, zéro FOUT, pas d'appel réseau à Google en prod).
 *
 * - Display : Bricolage Grotesque (caractère, chaleur) → titres, CTA, chiffres.
 * - Corps   : Inter (lisibilité mobile, neutralité).
 *
 * Les variables CSS sont consommées par `@theme` dans `globals.css`
 * (`--font-display`, `--font-sans`).
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

/** Classe à poser sur <html> pour exposer les deux variables de police. */
export const fontVariables = `${inter.variable} ${bricolage.variable}`;
