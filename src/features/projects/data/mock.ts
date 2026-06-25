import { mockScoreFromInput } from "@/features/scoring";
import type { Project, ProjectStatus } from "../types/project.types";

/** Projets mockés (design-first). Au Sprint INT : `GET /projects`. */
const RAW: Omit<Project, "score">[] = [
  {
    id: "p1",
    name: "AgriConnect",
    founderName: "Awa Diallo",
    sector: "Agritech",
    category: "agritech",
    archetype: "terrain",
    status: "in_review",
    createdAt: "18 juin 2026",
    assignee: "Mariam l'Analyste",
  },
  {
    id: "p2",
    name: "PayNow",
    founderName: "Koffi Mensah",
    sector: "Fintech",
    category: "fintech",
    archetype: "digital",
    status: "qualified",
    createdAt: "15 juin 2026",
    assignee: null,
  },
  {
    id: "p3",
    name: "EduPlus",
    founderName: "Fatou Sow",
    sector: "Edtech",
    category: "edtech",
    archetype: "digital",
    status: "excellence",
    createdAt: "12 juin 2026",
    assignee: "Mariam l'Analyste",
  },
  {
    id: "p4",
    name: "HealthLink",
    founderName: "Jean Kabongo",
    sector: "Santé",
    category: "sante",
    archetype: "digital",
    status: "new_diagnostic",
    createdAt: "21 juin 2026",
    assignee: null,
  },
  {
    id: "p5",
    name: "MarketBoda",
    founderName: "Amina Yusuf",
    sector: "Commerce",
    category: "commerce",
    archetype: "terrain",
    status: "needs_work",
    createdAt: "10 juin 2026",
    assignee: null,
  },
  {
    id: "p6",
    name: "SolarKit",
    founderName: "Ibrahim Touré",
    sector: "Agritech",
    category: "agritech",
    archetype: "terrain",
    status: "rejected",
    createdAt: "5 juin 2026",
    assignee: "Mariam l'Analyste",
  },
];

export const mockProjects: Project[] = RAW.map((p) => ({
  ...p,
  score: mockScoreFromInput(p.name),
}));

export function getProject(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export const SECTORS = [...new Set(mockProjects.map((p) => p.sector))];

export const ALL_STATUSES: ProjectStatus[] = [
  "new_diagnostic",
  "in_review",
  "needs_work",
  "qualified",
  "excellence",
  "rejected",
];
