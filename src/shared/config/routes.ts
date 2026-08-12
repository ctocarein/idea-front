/**
 * Routes centralisées (ARCHITECTURE_FRONTEND.md §3, §5).
 * Source unique des chemins — on ne code jamais une URL en dur dans un composant.
 */
export const routes = {
  // Public
  home: "/",
  startups: "/startups",
  /** Face institutionnelle publique (concours, incubateurs, ONG, écoles). */
  institutions: "/institutions",
  financeurs: "/financeurs",
  diagnostic: "/diagnostic",
  blog: "/blog",
  contact: "/contact",
  legal: (doc: string) => `/legal/${doc}`,

  // Auth
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  verifyEmail: "/verify-email",
  forbidden: "/403",

  // Espace porteur (dashboard)
  dashboard: "/dashboard",
  /** Relecture des 12 dimensions — rend au porteur le projet que l'IA a rédigé. */
  ajuster: "/dashboard/ajuster",
  academy: "/dashboard/academy",
  academyTopic: (topic: string) => `/dashboard/academy?topic=${encodeURIComponent(topic)}`,
  besoins: "/dashboard/besoins",
  studio: "/dashboard/studio",
  pitchEditor: "/dashboard/pitch",
  pitchSim: "/dashboard/pitch-sim",
  pitchSimSession: (id: string) => `/dashboard/pitch-sim/${id}`,
  mentors: "/dashboard/mentors",
  readiness: "/dashboard/readiness",
  opportunities: "/dashboard/opportunites",
  project: (id: string) => `/dashboard/projects/${id}`,
  bilan: (id: string) => `/dashboard/bilan/${id}`,
  profile: "/dashboard/profile",
  shares: "/dashboard/shares",

  // Espace mentor
  mentorHome: "/mentor",

  // Back-office admin
  admin: "/admin",
  adminProjects: "/admin/projects",
  adminProject: (id: string) => `/admin/projects/${id}`,
  adminMentors: "/admin/mentors",
  adminOpportunities: "/admin/opportunities",
  adminScoringGrid: "/admin/scoring-grid",
  adminAuditLogs: "/admin/audit-logs",
  adminJobs: "/admin/jobs",
  adminLearningDashboard: "/admin/learning-dashboard",
} as const;

/** Catalogue interne du design system (hors production). */
export const internalRoutes = {
  catalogue: "/catalogue",
} as const;
