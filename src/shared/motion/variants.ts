import type { Variants, Transition } from "framer-motion";

/**
 * Variants de motion partagés (CHARTE_FRONTEND.md §2.3).
 * « Le mouvement sert le sens, jamais l'esprit AI-généré. »
 * `MotionConfig reducedMotion="user"` (app-providers) neutralise tout ça
 * automatiquement si l'utilisateur préfère moins d'animation.
 */

const easeOut: Transition["ease"] = [0.2, 0.7, 0.2, 1];

/** Entrée d'écran / d'étape : un « rise » discret (translateY 10px → 0). */
export const rise: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: easeOut },
  },
};

/** Apparition en liste légèrement décalée (parent). */
export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
