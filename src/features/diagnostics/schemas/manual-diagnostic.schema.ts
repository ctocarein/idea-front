import { z } from "zod";

/** Miroir client du DTO de diagnostic guidé (ARCHITECTURE_FRONTEND.md §8). */
export const manualDiagnosticSchema = z.object({
  projectName: z.string().min(2, "Donne un nom à ton projet."),
  sector: z.string().min(1, "Choisis une catégorie."),
  description: z
    .string()
    .min(20, "Décris ton projet (20 caractères minimum)."),
  // string (et non z.coerce.number) pour garder un type input/output stable
  // avec zodResolver ; converti en nombre au Sprint INT côté payload.
  fundingNeed: z.string().optional(),
  consent: z.literal(true, { error: "Consentement requis (RGPD)." }),
});

export type ManualDiagnosticInput = z.infer<typeof manualDiagnosticSchema>;
