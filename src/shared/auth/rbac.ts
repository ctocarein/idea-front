import type { Role } from "@/shared/config/site";
import { routes } from "@/shared/config/routes";
import type { Session } from "./session";

/**
 * RBAC côté UI (ARCHITECTURE_FRONTEND.md §7.1) — COSMÉTIQUE uniquement :
 * masquer ce qu'on ne peut pas faire. La vraie barrière reste le backend.
 * Ne jamais traiter un `can()` comme une garantie de sécurité.
 */

/** Espace d'atterrissage par défaut selon le rôle (après login). */
export function homePathFor(role: Role): string {
  switch (role) {
    case "admin":
      return routes.admin;
    case "mentor":
      return routes.mentorHome;
    case "analyst":
      return routes.admin; // l'analyste est fondu dans l'admin au MVP
    case "founder":
    default:
      return routes.dashboard;
  }
}

/** Le rôle a-t-il accès à un préfixe d'espace donné ? (miroir du proxy) */
export const SPACE_ROLES: Record<string, Role[]> = {
  "/admin": ["admin", "analyst"],
  "/mentor": ["mentor", "admin"],
  "/dashboard": ["founder", "admin"],
};

/** Permissions UX simples (étendues au besoin par les features). */
type Permission =
  | "project.changeStatus"
  | "mentor.certify"
  | "grid.manage"
  | "project.assign";

const PERMISSIONS: Record<Permission, Role[]> = {
  "project.changeStatus": ["admin", "analyst"],
  "project.assign": ["admin"],
  "grid.manage": ["admin"],
  "mentor.certify": ["mentor", "analyst", "admin"],
};

export function can(
  user: Pick<Session, "role"> | null | undefined,
  permission: Permission,
): boolean {
  if (!user) return false;
  return PERMISSIONS[permission]?.includes(user.role) ?? false;
}
