import { cookies } from "next/headers";

import { SESSION_COOKIE, decodeSession, type Session } from "./session";

/**
 * Lit la session côté serveur (Server Components / layouts).
 * `cookies()` est async en Next 16.
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}
