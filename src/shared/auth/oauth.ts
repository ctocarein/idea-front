/**
 * Connexion par fournisseur d'identité (Google, LinkedIn).
 *
 * C'est le **back qui mène la danse** : il détient les secrets OAuth, parle au fournisseur,
 * crée ou relie le compte, puis nous renvoie un code à usage unique. Le front n'échange ce
 * code que côté serveur → aucun jeton ne transite jamais par l'URL ni par le navigateur.
 *
 * Module PUR (aucun import next/react), à l'image de `session.ts` : utilisable dans les Route
 * Handlers du BFF comme dans les composants client.
 */

export const OAUTH_PROVIDERS = ["google", "linkedin"] as const;

export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export function isOAuthProvider(value: string): value is OAuthProvider {
  return (OAUTH_PROVIDERS as readonly string[]).includes(value);
}

/** Lecture d'un flag `NEXT_PUBLIC_*` (inliné au build) : "true"/"1" = on, sinon le défaut. */
function flag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
}

/**
 * Providers réellement proposés à l'écran. Un provider sans credentials côté backend afficherait
 * un bouton mort (erreur `oauth_provider` au clic) — on ne montre donc que ceux qui sont activés.
 * Défaut : Google visible ; LinkedIn masqué tant qu'il n'est pas configuré côté back (poser
 * `NEXT_PUBLIC_OAUTH_LINKEDIN=true` pour l'afficher). Chaque `process.env.NEXT_PUBLIC_*` doit être
 * référencé en clair — Next n'inline que les accès statiques.
 */
const OAUTH_ENABLED: Record<OAuthProvider, boolean> = {
  google: flag(process.env.NEXT_PUBLIC_OAUTH_GOOGLE, true),
  linkedin: flag(process.env.NEXT_PUBLIC_OAUTH_LINKEDIN, false),
};

export const ENABLED_OAUTH_PROVIDERS = OAUTH_PROVIDERS.filter((p) => OAUTH_ENABLED[p]);

/** Cookie court portant la destination post-connexion (le back n'a pas à la connaître). */
export const OAUTH_NEXT_COOKIE = "idx_oauth_next";

/** Durée de vie du cookie de destination : le temps d'un aller-retour chez le fournisseur. */
export const OAUTH_NEXT_MAX_AGE = 60 * 10;

/**
 * N'accepte qu'un chemin interne. Bloque les URL absolues et les `//host` — sans quoi un
 * `?next=` forgé transformerait notre écran de connexion en tremplin de phishing.
 */
export function safeNext(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.includes("\\")) return null;
  return value;
}
