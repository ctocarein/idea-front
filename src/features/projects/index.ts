/** Feature projects — pilotage du cycle de vie. Barrel. */
export { AddMemory } from "./components/AddMemory";
export { MyProjects, type ProjectReportRef } from "./components/MyProjects";
export { ProjectTable } from "./components/ProjectTable";
export { ProjectDetail } from "./components/ProjectDetail";
export { ProjectStatusBadge } from "./components/ProjectStatusBadge";
export { ProjectTimeline, type TimelineEvent } from "./components/ProjectTimeline";
export { toWorkspaceRadar } from "./lib/workspace-radar";
export {
  STATUS_LABEL,
  STATUS_VARIANT,
  nextStatuses,
} from "./lib/status-machine";
export { mockProjects, getProject, SECTORS, ALL_STATUSES } from "./data/mock";
export {
  PROJECT_STATUSES,
  type Project,
  type ProjectStatus,
  type Archetype,
} from "./types/project.types";
