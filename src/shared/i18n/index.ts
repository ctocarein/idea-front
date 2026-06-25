import { site } from "@/shared/config/site";

/**
 * i18n-ready (CHARTE §4) — Français aujourd'hui, mais on évite les chaînes
 * dispersées en figeant ici les libellés transverses. Au moment d'ajouter une
 * langue, ce module devient un dictionnaire par locale (sans refondre l'UI).
 *
 * Convention : un libellé réutilisé par ≥ 2 features se centralise ici ; un
 * texte propre à un écran reste dans cet écran.
 */
export const locale = site.locale;

export const messages = {
  actions: {
    continue: "Continuer",
    back: "Retour",
    save: "Enregistrer",
    cancel: "Annuler",
    retry: "Réessayer",
    signIn: "Se connecter",
    signOut: "Se déconnecter",
  },
  states: {
    loading: "Chargement…",
    empty: "Rien pour l'instant",
    error: "Quelque chose a coincé.",
  },
} as const;

export type Messages = typeof messages;
