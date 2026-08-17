import type { IdeaExtract, ManualDiagnosticPayload } from "../api/actions";

/**
 * Diagnostic anonyme en attente d'inscription. Un visiteur raconte son idée sans compte ;
 * on stashe **le récit organisé** (payload + les 12 dimensions rédigées par l'IA) et on le
 * rejoue dès qu'il a créé son espace → son projet pré-écrit l'attend, prêt à être relu.
 *
 * L'édition dimension par dimension ne se fait plus en anonyme : c'est le cœur de valeur,
 * elle vit derrière l'inscription (wizard `/dashboard/ajuster`).
 *
 * Stocké en localStorage (client-only) : pas de donnée perso dans les requêtes, et le
 * claim s'exécute côté navigateur après l'authentification.
 */
const KEY = "idx_pending_diagnostic";

/** Ce qu'on garde entre le récit anonyme et le premier écran post-inscription. */
export interface PendingDiagnostic {
  payload: ManualDiagnosticPayload;
  /**
   * Les 12 dimensions rédigées par l'IA — matière du wizard de relecture.
   * `null` désormais dans le cas normal : l'extraction ne tourne plus en anonyme, mais
   * seulement après l'inscription (à l'entrée du wizard `/dashboard/ajuster`). On la
   * réécrit ici une fois calculée pour qu'un refresh ne relance pas le LLM.
   */
  extract: IdeaExtract | null;
  /** Devise choisie au récit — rejouée par l'extraction post-inscription (suggestions chiffrées). */
  currency?: string;
  /** Langue du récit — idem, pour que l'extraction produise les dimensions dans la bonne langue. */
  lang?: string;
  /**
   * Le porteur a tranché son secteur. Drapeau explicite plutôt que déduit de la valeur :
   * `autre` est un choix légitime, on ne doit pas reposer la question à chaque refresh.
   */
  sectorConfirmed?: boolean;
}

/** Ancien format (payload nu) — encore possible dans un navigateur qui n'a pas rechargé. */
type StoredShape = PendingDiagnostic | ManualDiagnosticPayload;

function isLegacy(raw: StoredShape): raw is ManualDiagnosticPayload {
  return !("payload" in raw);
}

export function savePendingDiagnostic(
  payload: ManualDiagnosticPayload,
  extract: IdeaExtract | null = null,
  meta: { currency?: string; lang?: string; sectorConfirmed?: boolean } = {},
): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ payload, extract, ...meta } satisfies PendingDiagnostic),
    );
  } catch {
    // localStorage indisponible (mode privé strict) → on ignore, le gate reste fonctionnel.
  }
}

export function loadPendingDiagnostic(): PendingDiagnostic | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredShape;
    // Rétrocompat : un stash d'avant le wizard n'a pas d'extract → relecture impossible,
    // on le rejoue tel quel.
    return isLegacy(parsed) ? { payload: parsed, extract: null } : parsed;
  } catch {
    return null;
  }
}

export function clearPendingDiagnostic(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // idem
  }
}
