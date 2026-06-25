import type { RadarScore } from "@/features/scoring";

/** Statuts du cycle de vie projet (MVP). */
export const PROJECT_STATUSES = [
  "new_diagnostic",
  "in_review",
  "needs_work",
  "qualified",
  "excellence",
  "rejected",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type Archetype = "digital" | "terrain";

export interface Project {
  id: string;
  name: string;
  founderName: string;
  sector: string;
  category: string;
  archetype: Archetype;
  status: ProjectStatus;
  createdAt: string;
  assignee: string | null;
  /** Score Radar — absent de la liste admin (vit dans le détail du bilan). */
  score?: RadarScore | null;
}
