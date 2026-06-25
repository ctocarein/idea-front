/**
 * Catégories de projet + questions guidées (MIROIR design-first).
 * Au Sprint INT, elles viendront du backend (`/diagnostics` configure les jeux
 * de questions par catégorie — gouvernés par l'admin, cf. BESOINS_ADMIN §4).
 */
export interface GuidedQuestion {
  id: string;
  label: string;
  placeholder: string;
}

export interface Category {
  key: string;
  label: string;
  questions: GuidedQuestion[];
}

const COMMON: GuidedQuestion[] = [
  {
    id: "probleme",
    label: "Quel problème précis résous-tu, et pour qui ?",
    placeholder: "Le vrai point de douleur, et la personne qui le vit…",
  },
  {
    id: "solution",
    label: "En quoi ta solution est-elle différente de l'existant ?",
    placeholder: "Ce que tu fais que les autres ne font pas…",
  },
];

export const CATEGORIES: Category[] = [
  {
    key: "agritech",
    label: "Agritech",
    questions: [
      ...COMMON,
      {
        id: "terrain",
        label: "Comment atteins-tu les producteurs sur le terrain ?",
        placeholder: "Canaux, relais locaux, logistique…",
      },
    ],
  },
  {
    key: "fintech",
    label: "Fintech",
    questions: [
      ...COMMON,
      {
        id: "confiance",
        label: "Comment gagnes-tu la confiance et gères-tu la conformité ?",
        placeholder: "Sécurité, partenaires, régulation…",
      },
    ],
  },
  {
    key: "edtech",
    label: "Edtech",
    questions: [
      ...COMMON,
      {
        id: "engagement",
        label: "Comment maintiens-tu l'engagement des apprenants ?",
        placeholder: "Motivation, progression, résultats…",
      },
    ],
  },
  {
    key: "sante",
    label: "Santé",
    questions: [...COMMON],
  },
  {
    key: "commerce",
    label: "Commerce",
    questions: [...COMMON],
  },
  {
    key: "autre",
    label: "Autre",
    questions: [...COMMON],
  },
];

export function getCategory(key: string): Category | undefined {
  return CATEGORIES.find((c) => c.key === key);
}
