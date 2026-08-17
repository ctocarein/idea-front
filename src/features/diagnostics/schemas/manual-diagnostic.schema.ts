import { z } from "zod";

import { SECTOR_KEYS } from "../data/sectors";

/** Miroir client du DTO de diagnostic guidé (ARCHITECTURE_FRONTEND.md §8). */
export const manualDiagnosticSchema = z.object({
  projectName: z.string().min(2, "Donne un nom à ton projet."),
  // Vocabulaire fermé : le backend rejette (422) toute clé hors liste. On refuse ici
  // plutôt que de laisser partir une valeur libre qui serait perdue pour le corpus.
  sector: z.enum(SECTOR_KEYS, { error: "Choisis un secteur." }),
  description: z
    .string()
    .min(20, "Décris ton projet (20 caractères minimum)."),
  // string (et non z.coerce.number) pour garder un type input/output stable
  // avec zodResolver ; converti en nombre au Sprint INT côté payload.
  fundingNeed: z.string().optional(),
  consent: z.literal(true, { error: "Consentement requis (RGPD)." }),
});

export type ManualDiagnosticInput = z.infer<typeof manualDiagnosticSchema>;
