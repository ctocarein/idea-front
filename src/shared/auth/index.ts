/**
 * shared/auth — session, contexte utilisateur et helpers RBAC côté UI.
 * Barrel : porte d'entrée unique.
 *
 * Note : `server.ts` (getSession) n'est PAS réexporté ici car il est
 * `server-only` ; on l'importe directement depuis "@/shared/auth/server"
 * dans les Server Components, pour éviter de le tirer dans un bundle client.
 */
export {
  SESSION_COOKIE,
  encodeSession,
  decodeSession,
  type Session,
} from "./session";
export { SessionProvider, useSession } from "./provider";
export { can, homePathFor, SPACE_ROLES } from "./rbac";
