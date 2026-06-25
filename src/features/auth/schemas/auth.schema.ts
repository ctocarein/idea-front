import { z } from "zod";

/**
 * Miroir client des DTO d'auth (revalidés côté backend FastAPI au Sprint INT).
 * Contrat réconcilié : le backend expose `full_name` mais accepte l'alias `name`
 * (envoyé ici) ; `consent` est requis (RGPD) et horodaté à l'inscription.
 */
export const loginSchema = z.object({
  email: z.string().email("Un email valide, pour retrouver ton espace."),
  password: z.string().min(1, "Ton mot de passe."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Comment on t'appelle ?"),
  email: z.string().email("Un email valide, pour retrouver ton espace."),
  password: z.string().min(8, "8 caractères minimum."),
  consent: z.literal(true, {
    error: "Consentement requis (RGPD).",
  }),
});
export type RegisterInput = z.infer<typeof registerSchema>;
