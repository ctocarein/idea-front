/**
 * Secteurs d'activité — MIROIR CLIENT du vocabulaire fermé (`app/core/sector.py`).
 *
 * Même patron que la grille Radar (`features/scoring/types/scoring.types.ts`) : le backend
 * est la source de vérité, ce fichier fige les clés et les libellés d'affichage. 13 secteurs
 * stockés + `autre`, et 4 familles utilisées quand une case sectorielle est trop peu peuplée
 * pour comparer.
 *
 * Pourquoi un vocabulaire fermé plutôt qu'un champ libre : sans clés communes, aucun
 * regroupement n'est possible, donc aucune comparaison d'un projet à une population.
 * Le porteur ne SAISIT plus son secteur — il **confirme** celui que l'extraction a déduit
 * de son récit (`SectorConfirm`).
 *
 * Les libellés restent ici et non dans `messages/*.json` : ils doivent correspondre
 * exactement à ceux du backend (le même texte part dans le prompt de classement).
 */

import type { components } from "@/shared/api/schema";

/**
 * La clé vient du contrat backend, elle n'est pas redéclarée ici : si l'enum bouge côté
 * serveur, `SECTOR_LABELS`/`SECTOR_HINTS` (des `Record<SectorKey, string>`) et la garde
 * d'exhaustivité ci-dessous cassent le build. Un miroir qui dérive en silence serait pire
 * que pas de miroir — il enverrait des clés refusées en 422.
 */
export type SectorKey = components["schemas"]["Sector"];

/** Ordre d'affichage. `as const` : c'est lui qui donne son type à `z.enum` (schéma manuel). */
export const SECTOR_KEYS = [
  "agro",
  "commerce",
  "restauration",
  "artisanat_mode",
  "btp_immobilier",
  "transport_logistique",
  "sante",
  "education",
  "finance",
  "services_pro",
  "numerique",
  "energie_environnement",
  "tourisme_culture",
  "autre",
] as const satisfies readonly SectorKey[];

/**
 * Garde de compilation : la liste d'affichage doit couvrir l'enum backend, à la clé près.
 * Un secteur ajouté côté serveur et absent ici resterait invisible du porteur — cette
 * ligne casse le build plutôt que de le laisser passer.
 */
type Assert<T extends true> = T;
export type SectorKeysAreExhaustive = Assert<
  Exclude<SectorKey, (typeof SECTOR_KEYS)[number]> extends never ? true : false
>;

export const SECTOR_LABELS: Record<SectorKey, string> = {
  agro: "Agriculture & agro-transformation",
  commerce: "Commerce & distribution",
  restauration: "Restauration & alimentation",
  artisanat_mode: "Artisanat, mode & beauté",
  btp_immobilier: "BTP, matériaux & immobilier",
  transport_logistique: "Transport & logistique",
  sante: "Santé & bien-être",
  education: "Éducation & formation",
  finance: "Finance & assurance",
  services_pro: "Services aux entreprises",
  numerique: "Logiciel, plateformes & médias",
  energie_environnement: "Énergie, eau & environnement",
  tourisme_culture: "Tourisme, culture & événementiel",
  autre: "Autre",
};

/**
 * Exemples affichés sous chaque option. Un porteur qui hésite plus de deux secondes
 * choisit « autre », et un projet « autre » n'est comparable à aucune population :
 * ces exemples sont ce qui protège le corpus.
 */
export const SECTOR_HINTS: Record<SectorKey, string> = {
  agro: "maraîchage, anacarde, attiéké, élevage, pêche",
  commerce: "boutique, grossiste, import-export, e-commerce",
  restauration: "maquis, traiteur, pâtisserie, boissons",
  artisanat_mode: "pagne, couture, cosmétique, coiffure, décoration",
  btp_immobilier: "construction, briqueterie, agence immobilière",
  transport_logistique: "livraison, VTC, fret, entreposage",
  sante: "clinique, pharmacie, laboratoire, nutrition",
  education: "école, centre de formation, soutien scolaire",
  finance: "mobile money, microfinance, tontine, assurance",
  services_pro: "conseil, comptabilité, marketing, RH, sécurité",
  numerique: "SaaS, application, agence web, production de contenu",
  energie_environnement: "solaire, forage, déchets, recyclage",
  tourisme_culture: "hôtellerie, agence de voyage, événementiel, sport",
  autre: "aucun des secteurs ci-dessus",
};

const KEY_SET = new Set<string>(SECTOR_KEYS);

/** `true` si la valeur fait partie du vocabulaire fermé. */
export function isSectorKey(value: string | null | undefined): value is SectorKey {
  return !!value && KEY_SET.has(value);
}

/**
 * Libellé d'un secteur venu du backend. Une clé hors vocabulaire (projet créé avant la
 * fermeture, non rattrapé par la migration) s'affiche telle quelle plutôt que de disparaître.
 */
export function sectorLabel(sector: string | null | undefined): string {
  if (!sector) return SECTOR_LABELS.autre;
  if (isSectorKey(sector)) return SECTOR_LABELS[sector];
  return sector;
}
