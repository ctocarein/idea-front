# PLAN DESIGN-FIRST — FRONTEND IDEAXION

**Découpage en sprints d'une mise en œuvre _design-first_ du frontend Next.js.**
Posture senior · v1.0 · Confidentiel — Ideaxion.

> Ce plan organise la construction du **frontend seul**, découplé du backend Go. Il complète le `GUIDE.md` (qui planifie le MVP full-stack en sprints S1→S6) en proposant une **trajectoire visuelle d'abord** : on bâtit toute l'UI avec des données mockées, vérifiable dans le navigateur, puis on branche l'API à la fin.
> Autorité : `CHARTE_FRONTEND.md` (design/tokens) · `ARCHITECTURE_FRONTEND.md` (organisation) · `BESOINS_*` (périmètre). En cas de doute métier, le backend tranche.

---

## 0. Pourquoi design-first

Le marché est **mobile-first** et la valeur du MVP est la **transformation du porteur** — donc l'expérience. Construire l'UI complète en premier permet de :

1. **Valider le parcours et la charte « Aube » tôt**, dans le navigateur, sans attendre l'API.
2. **Itérer le design à coût faible** (mocks, pas de couplage backend).
3. **Découpler les équipes** : le front avance pendant que le backend Go se construit.
4. **Geler des contrats d'API par l'usage** : les mocks révèlent les données réellement nécessaires à chaque écran → OpenAPI plus juste.

**Règle :** chaque écran est livré avec ses **états** (chargement, vide, erreur) et respecte la **DoD composant** (charte §4). On ne livre jamais un écran « heureux » seul.

---

## 1. État des lieux (au démarrage)

Le scaffold réel **diverge des docs** — le plan en tient compte :

| Sujet | Doc | Repo réel | Action |
| :--- | :--- | :--- | :--- |
| Next / React | 14 / 18 | **16.2.9 / 19** | Lire `node_modules/next/dist/docs/` avant tout code (cf. `AGENTS.md`) |
| Tailwind | v3 + config JS | **v4** (`@theme` CSS) | Tokens dans `globals.css`, pas de `tailwind.config.ts` |
| Primitives | Radix à la main | **shadcn/ui** (new-york) | Base = shadcn (= Radix + Tailwind), stylé aux tokens Aube |
| Palette | « Aube » (corail) | indigo-violet OKLCH | **Décision : aligner sur Aube** (charte) — Sprint D0 |
| Fonts | Bricolage + Inter | Geist | Recâbler via `next/font` |
| Manquant | — | framer-motion, date-fns, vitest, playwright | Ajouter au fil des sprints |

**Codification :** `IDX-D<N>-<NN>` (D = design-first). Estimation Fibonacci (complexité).

---

## 2. Trajectoire des sprints

| Sprint | Thème | Livraison de valeur |
| :--- | :--- | :--- |
| **D0** | Fondations design & socle | tokens Aube + DS amorcé, catalogue visible |
| **D1** | Design system (`shared/ui`) | bibliothèque de composants complète |
| **D2** | Layouts & auth UI | les 4 espaces naviguables, onboarding |
| **D3** | Signature + entrée | Radar animé, site public, diagnostic |
| **D4** | Dashboard porteur (hub) | le cœur de la transformation, mocké |
| **D5** | Admin & mentor | curation, pilotage, marketplace |
| **D6** | Polish & recette visuelle | états, motion, a11y, tests |
| **INT** | Intégration API | mocks → vrais appels (post-validation) |

---

## 3. Détail des sprints

### SPRINT D0 — Fondations design & socle

🎯 *Le socle « Aube » est en place et un catalogue de démo prouve que les tokens fonctionnent.*

- **IDX-D0-01 — Tokens « Aube »** `[5]` : recâbler `globals.css` sur la palette charte (corail action, indigo, or, teal, dégradé `--dawn` réservé signature/sceaux). Conserver le format Tailwind v4 `@theme` + mode sombre. Aucun `#hex` hors tokens.
- **IDX-D0-02 — Typographie** `[2]` : `next/font` pour **Bricolage Grotesque** (500/700/800) + **Inter** (400/500/600), variables `--font-bricolage` / `--font-inter`, échelle de type de la charte.
- **IDX-D0-03 — Outillage** `[3]` : `cn()`, `cva`, ajout `framer-motion` + `date-fns` (locale `fr`), providers (`QueryClientProvider`, `sonner`, `next-themes`, reduced-motion).
- **IDX-D0-04 — Scaffolding feature-first** `[3]` : arbo `src/features/*` + `src/shared/{ui,api,auth,hooks,lib,config,motion,styles}`, règle ESLint `no-restricted-imports` (barrel obligatoire), paths `@/features` `@/shared`.
- **IDX-D0-05 — Page catalogue** `[2]` : route de démo qui rend tous les tokens et premiers composants (référence vivante du DS).

### SPRINT D1 — Design system (`shared/ui`)

🎯 *Toute brique d'UI réutilisable existe, accessible, responsive, testée.*

- **IDX-D1-01 — Primitifs** `[8]` : `Button` (primary/dark/ghost/danger, sm/md), `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Field` (label+erreur+aide), `Badge`, `Card`, `Chip`.
- **IDX-D1-02 — Overlays & feedback** `[5]` : `Modal` (Dialog), `Toast` (sonner), `EmptyState`, skeletons.
- **IDX-D1-03 — Composés** `[8]` : `DataTable` (tri/pagination/filtres), `Stepper`, `FileUpload` (UI presigned mockée).
- **DoD composant** appliquée à chacun : tokens only, variants typés, états loading/disabled, a11y (clavier/focus/aria), 360px→desktop, reduced-motion, test de rendu+interaction, exporté par barrel.

### SPRINT D2 — Layouts & authentification (UI)

🎯 *On se « connecte » (session mockée) et on atterrit dans le bon espace.*

- **IDX-D2-01 — Route groups & layouts** `[5]` : `(public)`, `(dashboard)`, `(admin)`, `(mentor)` + coquilles (nav mobile-first, header, garde d'auth UI). `(investor)` préparé, non développé.
- **IDX-D2-02 — `middleware.ts`** `[3]` : gardes par rôle (`founder`/`mentor`/`analyst`/`admin`), session lue d'un cookie mocké, redirection `/login` et `/403`.
- **IDX-D2-03 — Auth UI** `[5]` : login, register, mot de passe oublié ; redirection par rôle ; `features/auth`.
- **IDX-D2-04 — Onboarding** `[5]` : porter `onboarding_ideaxion.jsx` en `features/auth`, styles passés aux tokens Aube, `Stepper`.
- **IDX-D2-05 — Écrans transverses** `[3]` : `403`, `not-found`, `error.tsx`, `loading.tsx` (patterns réutilisables).

### SPRINT D3 — Signature (Radar) + parcours d'entrée

🎯 *La signature « Aube » est à l'écran ; un visiteur passe le diagnostic (mock).*

- **IDX-D3-01 — `features/scoring`** `[8]` : `RadarChart` (12 dimensions, tracé animé au chargement), `ComprehensionTable` (4 piliers SENS/VIABILITÉ/SCALABILITÉ/EXÉCUTION), `RadarHex` (ornement). Dégradé d'aube ici uniquement. *(Grille v2 — `GRILLE_RADAR_V2.md`.)*
- **IDX-D3-02 — Site public** `[8]` : `/`, `/startups`, `/financeurs`, `/blog`, `/contact`, `/legal/[doc]` — SEO, LCP soigné, Server Components.
- **IDX-D3-03 — `features/diagnostics` flow A** `[5]` : idée guidée (choix catégorie → questions, `Stepper`), `react-hook-form` + Zod, soumission mockée.
- **IDX-D3-04 — `features/diagnostics` flow B** `[3]` : upload (`FileUpload`), écran d'extraction mocké, même sortie que flow A.

### SPRINT D4 — Dashboard porteur (hub d'apprentissage)

🎯 *Le porteur comprend, apprend, s'exerce et réalise où il en est — tout mocké.*

- **IDX-D4-01 — Hub dashboard** `[5]` : tableau de compréhension + boussole Radar + progression + état du projet.
- **IDX-D4-02 — `features/academy`** `[5]` : liste/lecture de modules, progression, mode « construire guidé » (chat, le porteur écrit).
- **IDX-D4-03 — `features/pitch-simulator`** `[8]` : chat IA-investisseur (feuille `"use client"`), `PitchFeedbackPanel` (réutilise `scoring`), rejeu, courbe avant/après.
- **IDX-D4-04 — `readiness`** `[3]` : synthèse + « ce qu'il me reste », CTA Phase Pro non agressif.
- **IDX-D4-05 — `reports` + `documents` + notifications** `[5]` : rapport in-app, data room (`FileUpload`), notifications in-app légères.

### SPRINT D5 — Espaces admin & mentor

🎯 *L'admin pilote et cure ; le mentor a son espace ; le porteur choisit un mentor.*

- **IDX-D5-01 — Back-office projets** `[8]` : `DataTable` filtrable, détail (diagnostic, Radar, documents, timeline), machine à états UX (transitions légales masquées), assignation.
- **IDX-D5-02 — Tableau d'apprentissage admin** `[5]` : transformation (Radar avant/après), rétention, signaux d'intention, liquidité — la raison d'être du freemium.
- **IDX-D5-03 — Curation & grille** `[5]` : candidatures mentor → création compte, activer/suspendre, gouvernance/versionnage grille, audit logs.
- **IDX-D5-04 — Espace mentor + marketplace** `[5]` : profil/secteurs/agenda/honoraires, demandes ; côté porteur `MentorMarketplace` + `MentorProfileCard` (découverte/choix).

### SPRINT D6 — Polish, états, a11y, motion & recette visuelle

🎯 *Le produit visuel est tenu : aucun écran blanc, AA partout, charte respectée.*

- **IDX-D6-01 — États complets** `[5]` : chargement (skeletons/Suspense), vide (`EmptyState`), erreur (`error.tsx` + toast) sur chaque écran.
- **IDX-D6-02 — Motion** `[3]` : `rise` d'entrée, micro-interactions hover/press, tracé Radar — `useReducedMotion()` respecté.
- **IDX-D6-03 — A11y & responsive** `[5]` : audit AA, focus visible, clavier, cibles ≥ 44px, 360px→desktop.
- **IDX-D6-04 — i18n-ready** `[2]` : centraliser les libellés (`fr` aujourd'hui), zéro chaîne en dur dispersée.
- **IDX-D6-05 — Tests** `[5]` : Vitest + Testing Library (DS + `lib/`), Playwright parcours critiques (onboarding, diagnostic).

### SPRINT INT — Intégration API (après validation visuelle)

🎯 *Les mocks deviennent de vrais appels, sans toucher à l'UI.*

- **IDX-INT-01 — Types générés** `[3]` : `openapi-typescript` → `shared/api/generated.ts`.
- **IDX-INT-02 — Client HTTP** `[3]` : `shared/api/client.ts` (`apiFetch`, `ApiError`, enveloppe d'erreur miroir backend), query-client.
- **IDX-INT-03 — BFF auth** `[5]` : Route Handlers `app/api/auth/{login,refresh,logout}` (cookie HttpOnly), refresh silencieux au 401.
- **IDX-INT-04 — Branchement par feature** `[13]` : `api/{keys,queries,mutations}.ts` par feature, remplacement progressif des mocks, invalidation React Query.

---

## 4. Principes transverses (rappel)

- **Mobile-first** vérifié à 360px avant tout.
- **Feature-first** : import via barrel `@/features/x` uniquement.
- **Server-first** : `"use client"` le plus bas possible.
- **Tokens only** : zéro `#hex` dans un feature ; dégradé d'aube réservé signature/sceaux.
- **Mocks isolés** : centraliser les fixtures par feature (`__mocks__` ou `fixtures.ts`) pour les retirer proprement en INT.
- **Pré-code** : lire `node_modules/next/dist/docs/` (Next 16 a des breaking changes — `AGENTS.md`).

---

## 5. Dépendances entre sprints

```
D0 (tokens + socle)
 └─> D1 (DS) ──> D2 (layouts/auth) ──> D3, D4, D5 (écrans, en parallèle possible)
                 D3 (scoring) ──────> D4 (réutilise RadarChart), D5 (RadarScoreForm)
 D3/D4/D5 ──> D6 (polish/recette) ──> INT (intégration API)
```

Point critique : **`features/scoring` (D3) est réutilisé partout** (diagnostics, academy, pitch-sim, admin) — à stabiliser tôt.

---

*Plan design-first — frontend découplé, mobile-first, charte « Aube ».*
*Complète `GUIDE.md`. Aligné `CHARTE_FRONTEND.md`, `ARCHITECTURE_FRONTEND.md`, `BESOINS_*`. Confidentiel — Ideaxion.*
