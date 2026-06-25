# CHARTE & FONDATIONS FRONTEND — IDEAXION

**Le système de design et le socle d'ingénierie du front · Posture senior · v1.0 · Confidentiel — Ideaxion.**

> Ce document transforme la direction visuelle « Aube » (validée sur l'ébauche d'onboarding) en un **système réutilisable** : tokens, typographie, composants, motion, structure de projet, et standard de qualité.
> Il complète `ARCHITECTURE_FRONTEND.md` (qui décrit l'organisation feature-first) en décrivant **la couche design et le setup**. En cas de doute sur l'organisation du code, l'archi fait foi ; sur le design et les tokens, **ce document fait foi**.

**Principes directeurs**
1. **Mobile-first**, toujours. Le marché est sur mobile ; on conçoit pour 360 px d'abord, on étend ensuite.
2. **Une seule audace.** La signature (le Radar de Collision + le dégradé d'aube) est le seul élément spectaculaire. Tout le reste est discipliné et silencieux.
3. **Aucune couleur en dur.** Tout passe par les tokens. Un secteur ne décide jamais d'un `#hex`.
4. **Accessible par défaut.** Focus visible, contrastes AA, clavier, `prefers-reduced-motion` — c'est un plancher, pas une option.

---

## 1. Identité visuelle — la charte

### 1.1. Direction « Aube »

Le parcours du porteur va de la **nuit** (le mur de la peur et de l'ignorance — indigo profond) vers la **lumière** (un dégradé d'aube corail → or qui perce). La **signature** est l'hexagone du **Radar de Collision** : l'instrument même du produit, jamais une décoration. C'est lui qu'on montre en premier.

### 1.2. Couleurs

**Primitives**

| Token | Hex | Rôle |
| :--- | :--- | :--- |
| `--ink` | `#1C1633` | Indigo profond — fonds héro, texte fort, la « nuit » |
| `--ink-soft` | `#2A2147` | Indigo adouci — surfaces sombres secondaires |
| `--paper` | `#F7F6FB` | Blanc lavande — fond d'application |
| `--card` | `#FFFFFF` | Surfaces, cartes, champs |
| `--coral` | `#FF7A4D` | Accent primaire — l'étincelle, l'action |
| `--gold` | `#F4B740` | Accent chaud secondaire |
| `--teal` | `#1FB0A0` | Croissance, viabilité, succès (parcimonie) |
| `--muted` | `#6F6A86` | Texte secondaire |
| `--line` | `#E7E4F0` | Bordures, séparateurs |
| `--danger` | `#E0473B` | Erreurs |

**Dégradé signature** — `--dawn: linear-gradient(105deg, #FF7A4D 0%, #F4B740 100%)`. **Réservé à la signature (le Radar) et aux sceaux décoratifs — jamais sur les boutons ni le texte.** Les boutons et le texte sont en **aplats** : action en coral plein, texte en `--ink` ou `--coral`. Cette règle garde le dégradé rare et fort, et les CTA/titres nets et lisibles.

**Teinte d'action renforcée** — `--coral-strong: #EA5A2C` : la version du coral utilisée comme **fond de bouton** quand le libellé est blanc, pour rester en contraste AA.

**Tokens sémantiques** (on code avec ceux-ci, pas avec les primitives) :

```
--bg            : var(--paper)      /* fond appli            */
--surface       : var(--card)       /* cartes, champs        */
--text          : var(--ink)        /* texte principal       */
--text-muted    : var(--muted)      /* texte secondaire      */
--border        : var(--line)
--primary       : var(--coral)      /* action, focus         */
--accent        : var(--gold)
--success       : var(--teal)
--danger        : var(--danger)
--on-dark       : #FFFFFF           /* texte sur ink/gradient */
```

**Règles d'usage**
- **Coral** = action et focus (un seul accent d'action par écran). **Gold** = chaleur d'appoint. **Teal** = croissance/succès, jamais comme bouton d'action générique.
- Contraste : texte sur `--paper`/`--card` ≥ 4.5:1 ; `--muted` réservé au texte secondaire (≥ 4.5:1 vérifié). **Boutons en aplat :** fond `--coral-strong` + libellé blanc (AA), ou fond `--coral` + libellé `--ink`. Sur les rares surfaces en dégradé (signature, sceau), icône/texte en `--ink`.

### 1.3. Typographie

**Display — Bricolage Grotesque** (500/700/800) : caractère, chaleur moderne. Titres, CTA, chiffres-clés.
**Corps — Inter** (400/500/600) : lisibilité mobile, neutralité au service du contenu.

**Échelle de type** (mobile-first ; `px / line-height / weight`)

| Rôle | Valeur | Police |
| :--- | :--- | :--- |
| Display XL (héro) | `33 / 1.06 / 800` | Bricolage |
| Display L (succès) | `26 / 1.10 / 800` | Bricolage |
| Titre H1 (question) | `24 / 1.12 / 700` | Bricolage |
| Titre H2 | `20 / 1.20 / 700` | Bricolage |
| Corps L | `16 / 1.50 / 400` | Inter |
| Corps | `15 / 1.55 / 400` | Inter |
| Corps S | `13.5 / 1.45 / 400` | Inter |
| Légende | `12.5 / 1.40 / 500` | Inter |
| Eyebrow | `12 / 1 / 600`, `letter-spacing .14em`, UPPERCASE | Inter |

Display en `letter-spacing: -0.02em`. Chiffres en `font-variant-numeric: tabular-nums` (compteurs, scores).

### 1.4. Iconographie

**lucide-react** (`0.383.0`). Trait fin et cohérent, parfait avec Bricolage/Inter. Tailles : `18` (inline), `20` (boutons), `24` (cartes/portes), `36-40` (sceaux). Jamais d'emoji décoratif dans l'UI métier (sauf accent ponctuel et assumé, ex. accueil porteur).

### 1.5. Formes & élévation

- **Rayons** : `sm 10` · `md 13` (champs) · `lg 15` (options, CTA) · `xl 20` (cartes) · `2xl 28` (frame) · `pill 999`.
- **Ombres** (teintées indigo, jamais du noir pur) :
  `--shadow-card: 0 18px 40px -22px rgba(28,22,51,.45)` ·
  `--shadow-cta: 0 12px 26px -10px rgba(255,122,77,.55)` ·
  `--shadow-frame: 0 30px 80px -30px rgba(10,5,30,.7)`.

### 1.6. Ton & écriture (UX writing)

- **Porteur : tutoiement**, ton encourageant, jamais culpabilisant. *« Pas de mauvaise réponse. On part d'où tu es. »*
- **Investisseur : vouvoiement**, sobre et précis.
- **Sentence case** partout, voix active. Un bouton dit ce qu'il fait (« Créer mon espace », pas « Soumettre »), et le même mot suit toute l'action.
- **Erreurs** : utiles, jamais d'excuse vague. *« Un email valide, pour retrouver ton espace. »*
- **Écrans vides** : une invitation à agir, pas une humeur.

---

## 2. Composants, plugins & motion

### 2.1. Stack technique (les plugins, et pourquoi)

| Besoin | Choix | Pourquoi |
| :--- | :--- | :--- |
| Framework | **Next.js 14+ (App Router)** | SSR/SSG, RSC, routing par fichiers (cf. archi). |
| Langage | **TypeScript strict** | `strict: true`, aucun `any` injustifié. |
| Styles | **Tailwind CSS** + **CSS variables** | Utilitaires rapides + theming par tokens (pas de couleur en dur). |
| Primitives accessibles | **Radix UI** (Dialog, Select, Checkbox, Toast, Popover…) | L'accessibilité (focus trap, aria, clavier) est **résolue à la racine**, on ne la réinvente pas. On stylise par-dessus avec nos tokens. |
| État serveur | **@tanstack/react-query** | Cache, invalidation, refetch. Pas de store global redondant. |
| Formulaires | **react-hook-form** + **zod** + `@hookform/resolvers` | Validation miroir des DTO backend, perfs, peu de re-renders. |
| Icônes | **lucide-react** | Cohérent avec la charte. |
| Motion | **framer-motion** | Animations déclaratives, respecte `reduced-motion`, utilisé **avec parcimonie**. |
| Utilitaires classes | **clsx** + **tailwind-merge** (`cn()`) | Composition de classes sans conflits. |
| Types d'API | **openapi-typescript** | Types **générés** depuis l'OpenAPI (jamais recopiés). |
| Dates | **date-fns** | Léger, tree-shakable, locale `fr`. |

**Ce qu'on n'ajoute PAS** (discipline senior) : pas de librairie de composants lourde (MUI/Chakra) qui écrase notre identité ; pas de CSS-in-JS runtime (Tailwind + vars suffisent) ; pas de Redux/Zustand global (React Query + état local de feature). **Peu de dépendances, bien choisies.**

### 2.2. Le design system (`src/shared/ui`)

Composants **sans métier** (un `Badge` reçoit un statut en prop, il ne sait pas ce qu'est un projet). Bâtis sur Radix + tokens.

**Primitifs** : `Button` · `Input` · `Select` · `Textarea` · `Checkbox` · `Radio` · `Modal` (Dialog) · `Toast` · `Badge` · `Card` · `Chip` · `FileUpload`.
**Composés** : `DataTable` (tri/pagination/filtres) · `Stepper` (progression onboarding) · `Field` (label + erreur + aide) · `EmptyState`.
**Signature** : `RadarChart` (12 dimensions, vue experte) · `RadarHex` (motif/ornement) · `ComprehensionTable` (4 piliers, vue porteur) — vivent dans `src/features/scoring` car porteurs de sens métier, mais consomment les tokens. *(Grille v2 — voir `GRILLE_RADAR_V2.md`.)*

> **Évolution (à formaliser) — style « document/rapport ».** Le rapport de pré-diagnostic
> (`RAPPORT_PREDIAGNOSTIC.md`, généré PDF) introduit un registre **document** (3 pages, tableaux,
> radar 12 axes, matrice de risques, verdict). Il **reste dans la direction « Aube »** (indigo/corail/gold/teal,
> dégradé réservé au sceau) ; la maquette source en navy/ambre a été **recolorée à la charte**. À ajouter
> ici comme sous-système « document » (tokens d'impression A4, densité, tableaux de données).

Chaque composant a des **variants** explicites (ex. `Button`: `primary | dark | ghost | danger`, `size: sm | md`). Variants gérés via `cva` (class-variance-authority) ou un mapping simple — jamais de styles ad hoc dispersés.

```tsx
// shared/ui/Button.tsx — exemple de discipline (tokens + variants)
const styles = {
  base: "inline-flex items-center justify-center gap-2 rounded-[15px] font-display font-bold " +
        "transition-transform duration-150 active:translate-y-0 focus-visible:outline-none " +
        "focus-visible:ring-4 focus-visible:ring-[color:var(--primary)]/25 disabled:opacity-50",
  variant: {
    primary: "text-white bg-[color:var(--coral-strong)] shadow-[var(--shadow-cta)] hover:-translate-y-0.5",
    dark:    "text-white bg-[color:var(--ink)] hover:-translate-y-0.5",
    ghost:   "text-[color:var(--text)] bg-transparent hover:bg-[color:var(--line)]/50",
    danger:  "text-white bg-[color:var(--danger)]",
  },
  size: { md: "text-base px-5 py-4", sm: "text-sm px-4 py-2.5" },
};
```

### 2.3. Motion

**Principe : le mouvement sert le sens, jamais l'esprit AI-généré.** Une seule chorégraphie qui compte (l'entrée d'écran), des micro-interactions discrètes, et rien d'autre.

**Tokens de motion**
```
--ease-out : cubic-bezier(.2,.7,.2,1);   /* standard, "rise"        */
--ease-in-out : cubic-bezier(.4,0,.2,1); /* barres de progression   */
--dur-fast : 150ms;   /* hover, focus, sélection                    */
--dur-base : 250ms;   /* transitions d'état                         */
--dur-slow : 420ms;   /* entrée d'écran, étapes                     */
```

**Où le mouvement est permis**
- **Entrée d'écran / d'étape** : un `rise` discret (translateY 10px → 0, opacity 0 → 1) sur `--dur-slow`.
- **Hover/press** des cartes et CTA : élévation de 2-3 px, `--dur-fast`.
- **Sélection** d'une option : transition de bordure/fond, `--dur-fast`.
- **La signature Radar** : tracé du polygone au chargement (une fois).

**Interdits** : parallax gratuit, éléments qui flottent en boucle, apparitions en cascade décoratives.

**Accessibilité** : tout est encadré par
```css
@media (prefers-reduced-motion: reduce){ *{ animation:none !important; transition:none !important; } }
```
Avec framer-motion, on respecte `useReducedMotion()` et on désactive les variantes animées.

---

## 3. Structuration du projet

Feature-first (détaillé dans `ARCHITECTURE_FRONTEND.md` §3). Vue centrée sur la **couche design** :

```text
/frontend
├── app/                       # routing + composition (mince)
│   ├── (public)/ (dashboard)/ (admin)/ (mentor)/
│   ├── layout.tsx             # RootLayout : fonts, providers, tokens
│   └── globals.css            # @tailwind + :root tokens + reduced-motion
├── src/
│   ├── features/*             # le métier (auth, scoring, academy, …)
│   └── shared/
│       ├── ui/                # ★ design system (primitifs + composés)
│       ├── motion/            # variants framer-motion + tokens JS
│       ├── styles/
│       │   ├── tokens.css     # toutes les variables (couleurs, type, motion)
│       │   └── fonts.ts       # next/font (Bricolage, Inter)
│       ├── lib/               # cn(), formatters (money XOF), dates (fr)
│       └── api/               # client typé + generated.ts (OpenAPI)
├── tailwind.config.ts         # theme étendu depuis les tokens
└── tsconfig.json              # strict, paths @/features @/shared
```

**Tokens en CSS variables** (`tokens.css`) — la source unique :
```css
:root{
  --ink:#1C1633; --ink-soft:#2A2147; --paper:#F7F6FB; --card:#FFFFFF;
  --coral:#FF7A4D; --coral-strong:#EA5A2C; --gold:#F4B740; --teal:#1FB0A0; --muted:#6F6A86;
  --line:#E7E4F0; --danger:#E0473B;
  --dawn:linear-gradient(105deg,#FF7A4D 0%,#F4B740 100%);
  --shadow-card:0 18px 40px -22px rgba(28,22,51,.45);
  --shadow-cta:0 12px 26px -10px rgba(255,122,77,.55);
  --radius-md:13px; --radius-lg:15px; --radius-xl:20px;
  --ease-out:cubic-bezier(.2,.7,.2,1); --dur-fast:150ms; --dur-slow:420ms;
}
```

**Tailwind lit les tokens** (jamais de hex dans `tailwind.config`) :
```ts
// tailwind.config.ts (extrait)
theme: { extend: {
  colors: {
    ink: "var(--ink)", paper: "var(--paper)", card: "var(--card)",
    coral: "var(--coral)", gold: "var(--gold)", teal: "var(--teal)",
    muted: "var(--muted)", line: "var(--line)", danger: "var(--danger)",
  },
  borderRadius: { md:"var(--radius-md)", lg:"var(--radius-lg)", xl:"var(--radius-xl)" },
  fontFamily: { display:["var(--font-bricolage)"], sans:["var(--font-inter)"] },
}}
```

**Fonts via `next/font`** (zéro FOUT, pas de `@import` réseau en prod) :
```ts
// shared/styles/fonts.ts
import { Inter, Bricolage_Grotesque } from "next/font/google";
export const inter = Inter({ subsets:["latin"], variable:"--font-inter" });
export const bricolage = Bricolage_Grotesque({ subsets:["latin"], weight:["500","700","800"], variable:"--font-bricolage" });
// app/layout.tsx : <html className={`${inter.variable} ${bricolage.variable}`}>
```

**Providers** (`app/layout.tsx`) : `QueryClientProvider`, `Toast` (Radix), `ReducedMotionProvider`. Aucun provider de thème lourd — les tokens CSS suffisent (un éventuel mode sombre = un second bloc `:root[data-theme="dark"]`).

---

## 4. Élaborer comme un senior — le standard

Ce qui sépare une maquette d'un produit tenu dans la durée.

**Plancher de qualité (non négociable, sur chaque écran)**
- **Responsive mobile-first** : conçu à 360 px, vérifié jusqu'au desktop.
- **Accessibilité** : focus visible (jamais `outline:none` sans remplacement), `aria-*` corrects (Radix les fournit), navigation clavier complète, contrastes AA, cibles tactiles ≥ 44 px.
- **`prefers-reduced-motion`** respecté partout.
- **États gérés** : chaque écran a son **chargement** (skeleton/Suspense via `loading.tsx`), son **vide** (`EmptyState`), son **erreur** (`error.tsx` + toast). Jamais d'écran blanc.

**Conventions de code**
- **Barrel obligatoire** : un feature s'importe par `@/features/x`, jamais par ses internes (règle ESLint `no-restricted-imports`).
- **Types générés** depuis l'OpenAPI ; on ne recopie pas un type qui existe côté serveur.
- **Server-first** : `"use client"` le plus bas possible dans l'arbre.
- **Theming par tokens** : zéro `#hex` dans un composant. Une couleur nouvelle → un token d'abord.
- **`cn()`** pour composer les classes ; variants via `cva`, pas de style inline dispersé.

**Performance**
- `next/image`, `next/font`, code-splitting par route (gratuit avec l'App Router).
- Viser un **LCP correct sur les pages publiques** (SEO + conversion). Pas de gros bundle client : le design system reste léger, les features se chargent à la demande.

**Internationalisation-ready**
- Français aujourd'hui, mais **pas de chaîne en dur dispersée** : centraliser les libellés (un module `i18n`/messages) pour pouvoir ajouter une langue sans refondre.

**Tests**
- **Vitest + Testing Library** : composants du DS + logique de `lib/`.
- **Playwright** : parcours critiques (onboarding porteur, diagnostic) — partagés avec la recette `OPS-01`.

**Definition of Done d'un composant front**
1. Tokens uniquement (aucune couleur/rayon en dur).
2. Variants typés + état `disabled`/`loading` gérés.
3. Accessible (clavier, focus, aria) — vérifié.
4. Responsive 360 px → desktop.
5. `reduced-motion` respecté.
6. Test de rendu + interaction.
7. Exporté par le barrel, importé nulle part par ses internes.

**Checklist de scaffolding (jour 0)**
- [ ] `create-next-app` (App Router, TS strict).
- [ ] Tailwind + `tokens.css` + `tailwind.config` branché sur les tokens.
- [ ] `next/font` (Bricolage + Inter) câblé dans `RootLayout`.
- [ ] Radix + `cn()` + `cva` installés ; premiers primitifs (`Button`, `Field`, `Input`).
- [ ] React Query + Toast providers.
- [ ] ESLint (barrel, no-`any`) + Prettier, bloquants en CI.
- [ ] `openapi-typescript` branché sur l'OpenAPI du backend.
- [ ] L'onboarding (l'ébauche `onboarding_ideaxion.jsx`) porté en `features/auth` + `features/investors`, styles passés en tokens.

---

*Charte & fondations frontend — la direction « Aube » en système, posture senior.*
*Complète `ARCHITECTURE_FRONTEND.md`. Référence design pour tous les écrans. Confidentiel — Ideaxion.*
