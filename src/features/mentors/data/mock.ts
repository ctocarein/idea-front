/** Mentors & candidatures mockés (design-first). Au Sprint INT : `/mentors/*`. */
export interface Mentor {
  id: string;
  name: string;
  sectors: string[];
  bio: string;
  verified: boolean;
  feeEur: number | null;
  status: "marketplace" | "suspended";
}

export interface MentorApplication {
  id: string;
  name: string;
  email: string;
  sectors: string[];
  status: "pending" | "accepted" | "rejected";
}

export const mockMentors: Mentor[] = [
  {
    id: "m1",
    name: "Koffi Mensah",
    sectors: ["Fintech", "Stratégie"],
    bio: "15 ans en paiement mobile. A accompagné 20+ startups vers leur première levée.",
    verified: true,
    feeEur: 80,
    status: "marketplace",
  },
  {
    id: "m2",
    name: "Mariam Sow",
    sectors: ["Agritech", "Terrain"],
    bio: "Opératrice terrain, experte unit economics et distribution rurale.",
    verified: true,
    feeEur: 60,
    status: "marketplace",
  },
  {
    id: "m3",
    name: "Aïcha Diop",
    sectors: ["Edtech", "Produit"],
    bio: "Product lead, spécialiste engagement et rétention produit.",
    verified: true,
    feeEur: null,
    status: "marketplace",
  },
  {
    id: "m4",
    name: "Daniel Okeke",
    sectors: ["Santé", "Réglementaire"],
    bio: "Ex-DAF santé, navigue la conformité et les modèles B2B.",
    verified: false,
    feeEur: 90,
    status: "suspended",
  },
];

export const mockApplications: MentorApplication[] = [
  {
    id: "a1",
    name: "Sophie Ndiaye",
    email: "sophie@exemple.com",
    sectors: ["Fintech"],
    status: "pending",
  },
  {
    id: "a2",
    name: "Marc Tehou",
    email: "marc@exemple.com",
    sectors: ["Commerce", "Marketing"],
    status: "pending",
  },
];

export const MENTOR_SECTORS = [
  ...new Set(mockMentors.flatMap((m) => m.sectors)),
];
