/**
 * Routes centralisées (ARCHITECTURE_FRONTEND.md §3, §5).
 * Source unique des chemins — on ne code jamais une URL en dur dans un composant.
 */
export const routes = {
  // Public
  home: "/",
  startups: "/startups",
  financeurs: "/financeurs",
  diagnostic: "/diagnostic",
  blog: "/blog",
  contact: "/contact",
  legal: (doc: string) => `/legal/${doc}`,

  // Auth
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  forbidden: "/403",

  // Espace porteur (dashboard)
  dashboard: "/dashboard",
  academy: "/dashboard/academy",
  pitchSim: "/dashboard/pitch-sim",
  mentors: "/dashboard/mentors",
  readiness: "/dashboard/readiness",
  opportunities: "/dashboard/opportunites",
  project: (id: string) => `/dashboard/projects/${id}`,
  bilan: (id: string) => `/dashboard/bilan/${id}`,

  // Espace mentor
  mentorHome: "/mentor",

  // Back-office admin
  admin: "/admin",
  adminProjects: "/admin/projects",
  adminProject: (id: string) => `/admin/projects/${id}`,
  adminMentors: "/admin/mentors",
  adminScoringGrid: "/admin/scoring-grid",
  adminAuditLogs: "/admin/audit-logs",
} as const;

/** Catalogue interne du design system (hors production). */
export const internalRoutes = {
  catalogue: "/catalogue",
} as const;
