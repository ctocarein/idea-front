/** Feature projects — pilotage du cycle de vie. Barrel. */
export { ProjectTable } from "./components/ProjectTable";
export { ProjectDetail } from "./components/ProjectDetail";
export { ProjectStatusBadge } from "./components/ProjectStatusBadge";
export { ProjectTimeline } from "./components/ProjectTimeline";
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
