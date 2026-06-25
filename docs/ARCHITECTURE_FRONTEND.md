# ARCHITECTURE FRONTEND — IDEAXION

**Structure du frontend Next.js, organisation feature-first, couche données et patterns transverses.**
Document de référence pour le dev fullstack · Posture senior · v2.0 (MVP freemium) · Confidentiel — Ideaxion.

> Ce document décrit *comment le front est structuré et pourquoi*. Il s'aligne sur `PARCOURS_PRODUIT.md` (vision), `SCENARIO_ENTREE.md` (entrée, phasage), les `BESOINS_*` (besoins par rôle) et le `GUIDE.md` (process). Le backend Go (`ARCHITECTURE_BACKEND.md`) est la **seule source de vérité métier** ; ce front n'en est qu'un consommateur — en cas de doute sur une règle métier, **c'est le backend qui tranche**.
> **La couche design (tokens, couleurs, typographie, composants, motion) vit dans `CHARTE_FRONTEND.md`** — ce document ne la duplique pas, il s'y réfère.

---

## 1. Principes directeurs

Sept règles. Tout le reste en découle.

1. **Mobile-first, toujours.** Le marché est sur mobile. On conçoit à 360 px d'abord, on étend ensuite. Tout écran porteur est vérifié sur petit écran avant tout.
2. **Feature-first, pas layer-first.** On organise le code par **domaine métier** (`auth`, `diagnostics`, `scoring`…), pas par nature technique. Toute la logique d'une fonctionnalité vit dans un seul dossier.
3. **`app/` est mince.** L'App Router ne fait que du **routage et de la composition**. Aucune logique métier, aucun appel API direct dans une page.
4. **Server-first.** Server Components par défaut. `"use client"` uniquement sur les feuilles interactives. On descend la frontière client le plus bas possible.
5. **Isolation des features.** Un feature n'importe **jamais** les internes d'un autre : il passe par son barrel (`index.ts`). Cela évite le plat de spaghettis et garde les features remplaçables.
6. **Une seule source de types.** Les types d'API sont **générés depuis l'OpenAPI** du backend. On ne recopie jamais un type qui existe côté serveur.
7. **Aucun secret côté client.** Les clés publiques éventuelles restent sur le backend ou les Route Handlers serveur. Le navigateur ne voit que des cookies HttpOnly et des données déjà autorisées par le RBAC backend.

> **Design :** tout passe par les tokens de `CHARTE_FRONTEND.md` (direction « Aube »). Zéro `#hex` dans un feature. Le dégradé d'aube est réservé à la signature (Radar) et aux sceaux — **jamais sur les boutons ni le texte** (aplats).

---

## 1bis. Périmètre — MVP freemium (12 mois) vs v2

Le MVP est **freemium** : on construit **le moteur de transformation, gratuit**, et on diffère tout ce qui est monétisation et industrialisation. Le front respecte ce phasage — les features ⏳ existent dans le découpage (pour ne pas refondre plus tard) mais **ne sont pas développées au MVP**.

| Périmètre | Features front | Statut |
| :--- | :--- | :--- |
| **MVP (gratuit)** | `auth` · site public · `diagnostics` (2 flows) · `scoring` (+ tableau de compréhension) · `academy` · `pitch-simulator` · `reports` (in-app) · `documents` · `mentors` (marketplace : profils + choix) · dashboard d'apprentissage + instrumentation | ✅ à construire |
| **v2 (monétisation / marketplace)** | `payments` · espace `(investor)` + `dealflow` + `investors` · `sprints`/`certifications` complets · `signatures` · booking/paiement mentors | ⏳ différé |

Conséquences front concrètes au MVP : **pas d'UI de paiement** (freemium), **pas d'espace investisseur** (concierge manuel côté fondateur), **le marketplace mentor se limite à la découverte/choix** (la réservation payante est v2). Le `middleware` garde quand même le rôle `mentor` et prépare le rôle `investor` (route v2).

---

## 2. Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│                        Navigateur                            │
│   Server Components (rendu serveur)  +  Client Components     │
└───────────────┬──────────────────────────────┬───────────────┘
                │ fetch (cookie HttpOnly)        │ React Query (client)
        ┌───────▼────────┐              ┌────────▼────────┐
        │  app/ (routes) │              │ src/features/*  │
        │  + middleware  │              │  api · ui · hooks│
        │  + Route       │              │  schemas · types │
        │   Handlers BFF │              └────────┬────────┘
        └───────┬────────┘                       │
                │  shared/api (client HTTP typé) │
                └───────────────┬────────────────┘
                                │ HTTP REST /api/v1 (Bearer + cookie)
                       ┌────────▼─────────┐
                       │   Go API (vérité  │
                       │   métier + RBAC)  │
                       └───────────────────┘
```

Le front a **deux modes de fetch** :
- **Server Component** → `fetch` direct vers l'API Go, côté serveur Next, en propageant le cookie de session. Idéal pour le premier rendu (listes, détails).
- **Client Component** → React Query via le client `shared/api`, pour l'interactif (mutations, refetch, optimistic UI).

Les **Route Handlers** (`app/api/*`) jouent le rôle de **BFF léger** : ils ne portent pas de métier, ils servent à manipuler le cookie HttpOnly (login/refresh/logout) que le client JS ne doit pas toucher directement.

---

## 3. Arborescence complète

```text
/frontend
├── app/                          # APP ROUTER — routage + composition UNIQUEMENT
│   ├── (public)/                 # route group : site public
│   │   ├── page.tsx              #   /
│   │   ├── startups/page.tsx
│   │   ├── financeurs/page.tsx
│   │   ├── diagnostic/page.tsx   #   entrée diagnostic (formulaire guidé + upload)
│   │   ├── blog/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── legal/[doc]/page.tsx  #   mentions, confidentialité, CGV
│   │   └── layout.tsx            #   PublicLayout
│   ├── (dashboard)/              # route group : espace porteur = HUB D'APPRENTISSAGE
│   │   ├── dashboard/
│   │   │   ├── page.tsx          #   tableau de compréhension (essence/viabilité/scalabilité) + progression
│   │   │   ├── academy/page.tsx  #   modules : comprendre BP, pitch, modèle éco
│   │   │   ├── pitch-sim/page.tsx#   simulateur de pitch (chat, rejouable)
│   │   │   ├── mentors/page.tsx  #   ★ marketplace : choisir un mentor (secteur, réputation, agenda)
│   │   │   ├── readiness/page.tsx#   « suis-je prêt ? » → prise de conscience → Phase Pro
│   │   │   └── projects/[id]/...
│   │   └── layout.tsx            #   DashboardLayout (garde d'auth)
│   ├── (investor)/   ⏳ v2       # espace financeur — DIFFÉRÉ (MVP = concierge manuel)
│   │   ├── investor/deal-flow/page.tsx
│   │   ├── investor/projects/[id]/page.tsx
│   │   ├── investor/requests/page.tsx
│   │   └── layout.tsx            #   InvestorLayout
│   ├── (admin)/                  # route group : back-office (auth + admin)
│   │   ├── admin/page.tsx
│   │   ├── admin/projects/[id]/page.tsx
│   │   ├── admin/projects/[id]/certification/page.tsx  # double sign-off (certificateurs)
│   │   ├── admin/mentors/page.tsx   # validation/calibration des mentors-certificateurs
│   │   ├── admin/payments/page.tsx  ⏳ v2
│   │   ├── admin/audit-logs/page.tsx
│   │   └── layout.tsx            #   AdminLayout
│   ├── (mentor)/                 # route group : espace mentor (auth, rôle mentor)
│   │   ├── mentor/page.tsx       #   profil, agenda, honoraires, demandes de coaching
│   │   ├── mentor/projects/[id]/validate/page.tsx  # portes de validation (si certificateur)
│   │   └── layout.tsx            #   MentorLayout
│   ├── api/                      # ROUTE HANDLERS (BFF : cookies, jamais de métier)
│   │   └── auth/
│   │       ├── login/route.ts    #   pose le cookie HttpOnly
│   │       ├── refresh/route.ts
│   │       └── logout/route.ts
│   ├── layout.tsx                # RootLayout (providers : React Query, Toast, Theme)
│   ├── error.tsx                 # error boundary global
│   ├── not-found.tsx
│   └── globals.css
│
├── src/
│   ├── features/                 # ★ FEATURE-FIRST — le cœur du code
│   │   ├── auth/
│   │   ├── scoring/            # Radar + tableau de compréhension (essence/viabilité/scalabilité)
│   │   ├── academy/           # ★ apprendre : modules, exercices, progression
│   │   ├── pitch-simulator/   # ★ s'entraîner : sessions IA-investisseur, feedback Radar
│   │   ├── diagnostics/       # 2 flows : idée guidée + upload
│   │   ├── projects/          # + archétype digital/terrain
│   │   ├── reports/           # rapport in-app (pas d'email)
│   │   ├── mentors/           # ★ marketplace : profils, réputation, agenda, choix porteur
│   │   ├── documents/         # upload (flow B + data room)
│   │   ├── notifications/     # in-app léger
│   │   ├── sprints/           # ⏳ portes de validation (Phase Pro)
│   │   ├── certifications/    # ⏳ double sign-off (certificateurs calibrés)
│   │   ├── investors/         # ⏳ v2 (MVP = concierge)
│   │   ├── dealflow/          # ⏳ v2
│   │   ├── payments/          # ⏳ v2 (MVP freemium)
│   │   └── signatures/        # ⏳ v2
│   │
│   ├── shared/                   # TRANSVERSE — aucun métier
│   │   ├── ui/                   # design system (tokens & composants — voir CHARTE_FRONTEND.md)
│   │   ├── api/
│   │   │   ├── client.ts         # client HTTP typé (fetch wrapper + erreurs)
│   │   │   ├── generated.ts      # types générés depuis l'OpenAPI (ne pas éditer)
│   │   │   └── query-client.ts   # config React Query
│   │   ├── auth/                 # session, contexte user, helpers RBAC côté UI
│   │   ├── hooks/                # useDebounce, useMediaQuery, usePagination…
│   │   ├── lib/                  # cn(), formatters, dates, money (XOF/EUR)
│   │   └── config/               # env public, constantes, routes
│   │
│   └── styles/                   # tokens, thème
│
├── middleware.ts                 # protection des routes par rôle (Edge)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json                 # strict: true, paths @/features, @/shared
├── .env.example
└── package.json
```

**Règle de lecture rapide :** si un fichier décide *quoi afficher selon une règle métier*, il est dans un **feature**. S'il ne fait que *router ou composer*, il est dans **app/**. S'il est *réutilisable sans métier* (un bouton, un formateur), il est dans **shared/**.

---

## 4. Anatomie d'un feature

Chaque feature suit **la même structure interne**. C'est la contrepartie front du module `internal/<module>` côté Go.

```text
src/features/projects/
├── api/
│   ├── keys.ts           # query keys factory (cache React Query)
│   ├── queries.ts        # useProjects(), useProject(id)  — lecture
│   └── mutations.ts      # useChangeStatus(), useUpdateProject()  — écriture
├── components/
│   ├── ProjectTable.tsx       # "use client" si interactif
│   ├── ProjectStatusBadge.tsx
│   ├── ProjectTimeline.tsx
│   ├── RadarChart.tsx
│   └── ProjectFilters.tsx
├── hooks/
│   └── useProjectFilters.ts   # état d'UI local au feature (filtres, tri)
├── schemas/
│   └── project.schema.ts      # Zod — miroir des DTO d'entrée backend
├── lib/
│   └── status-machine.ts      # miroir CLIENT de la machine à états (UX only)
├── types/
│   └── project.types.ts       # types dérivés de generated.ts + view models
└── index.ts                   # ★ API PUBLIQUE du feature (barrel)
```

### 4.1. Le barrel `index.ts` — la seule porte d'entrée

```ts
// src/features/projects/index.ts
export { ProjectTable } from "./components/ProjectTable";
export { ProjectStatusBadge } from "./components/ProjectStatusBadge";
export { useProjects, useProject } from "./api/queries";
export { useChangeStatus } from "./api/mutations";
export type { Project, ProjectStatus } from "./types/project.types";
// status-machine, schemas, hooks internes : NON exportés → privés au feature
```

Un autre feature ou une page importe **uniquement** `@/features/projects` :

```ts
import { ProjectTable, useProjects } from "@/features/projects"; // ✅
import { statusMachine } from "@/features/projects/lib/status-machine"; // ❌ interdit
```

Cette discipline (renforçable par une règle ESLint `no-restricted-imports`) garantit qu'on peut refondre l'intérieur d'un feature sans casser le reste de l'app.

### 4.2. Responsabilité de chaque dossier

| Dossier | Rôle | Ne contient jamais |
| :--- | :--- | :--- |
| `api/` | Appels au backend via React Query (queries/mutations) + query keys | Du JSX, des règles métier dures |
| `components/` | Le rendu (Server ou Client Components) | Des `fetch` directs (passent par `api/`) |
| `hooks/` | État d'UI **local au feature** (filtres, étapes d'un wizard) | De l'état serveur (c'est React Query) |
| `schemas/` | Validation Zod miroir des DTO backend | — |
| `lib/` | Pur métier d'affichage (machine à états UX, calculs) | Des effets de bord, du réseau |
| `types/` | Types dérivés de l'OpenAPI + view models | Des types réinventés à la main |

---

## 5. App Router & les 5 espaces (route groups)

Les **route groups** `(public)`, `(dashboard)`, `(investor)`, `(admin)` et `(mentor)` séparent les espaces **sans polluer l'URL** (les parenthèses ne créent pas de segment). Le 5ᵉ, `(mentor)`, est ajouté pour le réseau de mentors de la Vision CEO (§6.4) : un mentor n'est ni admin ni financeur, il valide les livrables qui lui sont assignés et co-signe la certification. Chaque groupe a son `layout.tsx` qui pose la coquille (navigation, garde d'auth) et compose les features.

```tsx
// app/(admin)/admin/projects/[id]/page.tsx — page MINCE
import { ProjectDetail } from "@/features/projects";       // tout le métier est ici
import { getProject } from "@/features/projects/api/server"; // fetch serveur

export default async function Page({ params }: { params: { id: string } }) {
  const project = await getProject(params.id); // Server Component : fetch direct API Go
  return <ProjectDetail project={project} />;
}
```

La page ne contient **ni état, ni logique** : elle récupère la donnée (server-side) et délègue l'affichage au feature. Tout ce qui est interactif (changer un statut, filtrer) est dans des Client Components à l'intérieur du feature.

### 5.1. Protection des routes — `middleware.ts`

Le `middleware` (Edge) garde chaque espace selon le rôle, **avant** le rendu. C'est le miroir front du RBAC backend (§8.3 archi backend) — mais le backend reste la vraie barrière ; le middleware n'est qu'une **première porte UX** (rediriger vite, pas exposer un écran interdit).

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { readSession } from "@/shared/auth/session";

const GUARDS: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin",     roles: ["admin"] },
  { prefix: "/mentor",    roles: ["mentor", "admin"] },
  { prefix: "/investor",  roles: ["investor", "admin"] },
  { prefix: "/dashboard", roles: ["founder", "admin"] },
];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const guard = GUARDS.find((g) => path.startsWith(g.prefix));
  if (!guard) return NextResponse.next(); // route publique

  const session = readSession(req); // décode le cookie (ne fait PAS confiance pour le métier)
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  if (!guard.roles.includes(session.role))
    return NextResponse.redirect(new URL("/403", req.url));

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/mentor/:path*", "/investor/:path*", "/dashboard/:path*"] };
```

---

## 6. Couche données (`shared/api` + feature `api/`)

### 6.1. Le client HTTP typé — un seul point de sortie réseau

```ts
// src/shared/api/client.ts
import type { paths } from "./generated"; // types issus de l'OpenAPI (openapi-typescript)

export class ApiError extends Error {
  constructor(public code: string, message: string, public details?: unknown[], public status?: number) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
    ...init,
    credentials: "include", // envoie le cookie HttpOnly
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    // enveloppe d'erreur UNIFORME, miroir du backend (§8.4 archi backend)
    const body = await res.json().catch(() => null);
    const e = body?.error ?? { code: "UNKNOWN", message: res.statusText };
    throw new ApiError(e.code, e.message, e.details, res.status);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
```

Personne dans l'app ne fait `fetch` à la main. Tout passe par `apiFetch`, qui parle le **même format d'erreur** que le backend (`{ error: { code, message, details } }`) — ce qui rend la gestion d'erreur homogène partout (§9).

### 6.2. Query keys, queries, mutations (React Query)

```ts
// src/features/projects/api/keys.ts
export const projectKeys = {
  all: ["projects"] as const,
  list: (filters: ProjectFilters) => [...projectKeys.all, "list", filters] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};

// src/features/projects/api/queries.ts
export function useProjects(filters: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => apiFetch<ProjectListResponse>(`/projects?${qs(filters)}`),
  });
}

// src/features/projects/api/mutations.ts
export function useChangeStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: ProjectStatus) =>
      apiFetch<Project>(`/projects/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) });
      qc.invalidateQueries({ queryKey: projectKeys.all }); // la liste change aussi
    },
  });
}
```

**Règle :** l'état **serveur** vit dans React Query (cache, invalidation, refetch). L'état **d'UI** (modale ouverte, filtre sélectionné) vit dans `useState`/`hooks/` du feature. On ne duplique jamais la donnée serveur dans un store global.

---

## 7. Authentification & RBAC côté front

Le flux d'auth respecte le backend (§8.3 archi backend) : access token JWT court + refresh token en **cookie HttpOnly Secure**, que le JS ne lit jamais.

```
1. Formulaire login (Client) → POST /api/auth/login (Route Handler BFF)
2. Le Route Handler appelle l'API Go, récupère le refresh token,
   le pose en cookie HttpOnly (le client JS ne le voit jamais).
3. middleware.ts lit la session (rôle) à chaque navigation protégée.
4. Au 401, le client tente POST /api/auth/refresh (silencieux) ; échec → redirect /login.
```

### 7.1. Helpers RBAC côté UI (cosmétique, pas sécurité)

Côté front, le RBAC sert **uniquement à l'UX** : masquer un bouton qu'on ne peut pas utiliser. La vraie autorisation est backend. Ne jamais traiter un `can()` front comme une garantie.

```tsx
// usage dans un composant
const { user } = useSession();
{can(user, "project.changeStatus") && <ChangeStatusButton projectId={id} />}
```

Si le bouton fuite par erreur, le backend renverra `403` — l'enveloppe d'erreur le transforme en toast propre. Défense en profondeur : le front cache, le back interdit.

---

## 8. Formulaires & validation (`schemas/` + react-hook-form + Zod)

Chaque formulaire valide côté client avec un **schéma Zod miroir du DTO backend**. Le client valide pour l'UX (feedback immédiat) ; le backend re-valide pour la sécurité. Les deux schémas doivent rester alignés (idéalement le Zod est dérivé de l'OpenAPI).

```ts
// src/features/diagnostics/schemas/manual-diagnostic.schema.ts
export const manualDiagnosticSchema = z.object({
  projectName: z.string().min(2, "Nom requis"),
  sector: z.string().min(1),
  description: z.string().min(20, "Décrivez votre projet (20 caractères min)"),
  fundingNeed: z.coerce.number().positive().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Consentement requis (RGPD)" }) }),
});
export type ManualDiagnosticInput = z.infer<typeof manualDiagnosticSchema>;
```

```tsx
// composant — formulaire de diagnostic guidé (flow A, IDX-DIAG-01)
const form = useForm<ManualDiagnosticInput>({ resolver: zodResolver(manualDiagnosticSchema) });
const submit = useSubmitManualDiagnostic(); // mutation React Query

<form onSubmit={form.handleSubmit((data) => submit.mutate(data))}>…</form>
```

---

## 9. Gestion d'erreurs & résilience côté front

Le front est un consommateur d'un système qui peut être **dégradé** (le LLM peut être indisponible — cf. `pkg/llm` + résilience backend). Il doit le refléter proprement, pas planter.

| Situation | Comportement front |
| :--- | :--- |
| `ApiError` 422 (règle métier) | Toast clair avec `error.message` (ex. transition illégale) |
| `ApiError` 403 | Redirection `/403` ou toast « action non autorisée » |
| `ApiError` 401 | Refresh silencieux ; si échec → `/login` |
| Réseau / 500 | `error.tsx` (error boundary) + bouton « réessayer » |
| IA (diagnostic) indisponible | Message « Notre IA fait une pause », analyse **différée** (job rejoué au retour) ; le porteur garde sa saisie |
| Paiement mobile money `pending` | **État d'attente assumé** : message « Validez sur votre téléphone (#150#) », polling doux du statut, jamais de « payé » optimiste (le webhook backend tranche) |
| Chargement | Skeletons via Suspense + `loading.tsx`, jamais d'écran blanc |

Chaque route a son `loading.tsx` (Suspense) et `error.tsx` (boundary). React Query gère le retry réseau (backoff léger) sur les erreurs transitoires, **pas** sur les 4xx métier (inutile de rejouer un 422).

---

## 10. Design system (`shared/ui`)

> **La charte complète (tokens, palette « Aube », typographie, motion, composants) vit dans `CHARTE_FRONTEND.md`.** Cette section ne décrit que l'**ancrage architectural** du design system dans le front.

Un **seul** jeu de composants pour tous les espaces — mutualisation stricte, zéro duplication entre porteur/admin/mentor. Bâti sur **Radix UI** (accessibilité résolue à la racine) + Tailwind + tokens CSS.

```text
src/shared/ui/
├── Button.tsx   Input.tsx   Select.tsx   Textarea.tsx   Checkbox.tsx
├── Modal.tsx    Toast.tsx   Badge.tsx    Card.tsx        Chip.tsx
├── FileUpload.tsx           # upload presigned (MinIO)
├── DataTable.tsx            # table générique : tri, pagination, filtres
├── Stepper.tsx  Field.tsx   EmptyState.tsx
└── (tokens en src/shared/styles/tokens.css — voir CHARTE_FRONTEND.md)
```

Principes :
- **Theming par tokens** (CSS variables). **Aucune couleur en dur** dans un feature ; le **dégradé d'aube** est réservé à la signature et aux sceaux, **jamais** aux boutons/textes (aplats — cf. charte).
- Composants **sans métier** : un `Badge` reçoit un statut en prop, il ignore ce qu'est un projet. Le `ProjectStatusBadge` (dans le feature) mappe statut → libellé/couleur et délègue au `Badge` générique.
- Accessibilité de base (focus visible, aria, clavier, contrastes AA) traitée **dans le design system** (Radix), pas réinventée par feature.
- **Mobile-first** garanti au niveau des composants et des layouts (cibles tactiles ≥ 44 px).
- La **signature** (`RadarChart`, `RadarHex`, `ComprehensionTable`) vit dans `features/scoring` (porteuse de sens métier) mais consomme les tokens partagés.

---

## 10ter. Features d'empowerment (Parcours produit)

Le dashboard porteur n'est **pas un tunnel de vente** : c'est un **hub d'apprentissage et de progression** (cf. `PARCOURS_PRODUIT.md`). Trois features portent la mission « rendre capable avant de mener au capital ».

### 10ter.1. `academy` — apprendre & progresser

Modules pédagogiques (comprendre un BP, un pitch, un modèle éco), exercices, et **progression** affichée. Le mode « construire (guidé) » est un assistant conversationnel où l'IA explique et questionne — **le porteur écrit**. Server Components pour le contenu (statique, SEO), Client Components pour l'interactif (exercices, assistant).

### 10ter.2. `pitch-simulator` — s'entraîner sans peur

Pièce maîtresse de l'engagement. Une UI de **chat** où l'IA joue l'investisseur, pose les questions difficiles, puis affiche un **feedback structuré sur le Radar** (réutilise `@/features/scoring`). Le porteur **rejoue à volonté**.

```tsx
// src/features/pitch-simulator/index.ts
export { PitchSimulator } from "./components/PitchSimulator";   // chat conversationnel
export { PitchFeedbackPanel } from "./components/PitchFeedbackPanel"; // feedback Radar
export { useStartSession, useSendTurn } from "./api/mutations";
```

- **MVP texte.** Le composant `PitchSimulator` est un chat ; la frontière `"use client"` est à la feuille (la zone de saisie + le flux de messages).
- **Vocal en évolution.** Le composant est pensé pour brancher un transport voix (Web Audio + STT/TTS) plus tard sans toucher au reste du feature.
- **Boussole.** Le feedback réutilise le `RadarChart` de `scoring` — le porteur voit, session après session, ses 12 dimensions progresser. C'est ce qui **révèle le besoin d'encadrement** (étape « prise de conscience » du Parcours) et amène, sans pression, vers la page `readiness`.

### 10ter.3. La page `readiness` — la prise de conscience, pas la pression

`/dashboard/readiness` est l'écran-pivot. Il synthétise la progression (Radar, exercices, pitchs joués) et **fait réaliser** au porteur où il en est : « ton projet est porteur, voici les axes encore faibles, un encadrement réel t'amènerait au niveau certifiable ». Le CTA vers la **Phase Pro** est présenté comme une suite logique, **jamais comme une injonction d'achat**. La conversion naît du constat, pas du marketing.

---

## 10bis. Features issues de la Vision CEO

Quatre features nouvelles ou enrichies, alignées sur le backend (§6bis archi backend). Toutes respectent la règle d'or : **le front propose, le backend dispose** — surtout pour la certification.

### 10bis.1. `scoring` — le Radar de Collision + le tableau de compréhension

Feature **partagé** : la même grille **v2 (12 dimensions / 4 piliers, /10)** sert au score d'entrée (`diagnostics`), à la **boussole pédagogique** (`academy`/`pitch-simulator`) et au score de sortie (`certifications`). On factorise le rendu dans un seul feature pour ne pas dupliquer le `RadarChart` ni les libellés de dimensions. *(Réf. `GRILLE_RADAR_V2.md`, `RAPPORT_PREDIAGNOSTIC.md`.)*

```ts
// src/features/scoring/index.ts
export { RadarChart } from "./components/RadarChart";            // 12 dimensions, lecture (expert)
export { ComprehensionTable } from "./components/ComprehensionTable"; // 4 piliers (porteur)
export { RadarScoreForm } from "./components/RadarScoreForm";    // 12 dimensions, saisie (validation)
export { AXES, LENSES, type RadarScore, type GridVersion } from "./types/scoring.types";
```

**Deux niveaux de lecture, un seul moteur.** Le porteur ne voit pas « 12 dimensions notées » : il voit le **tableau de compréhension** — les 4 piliers **SENS / VIABILITÉ / SCALABILITÉ / EXÉCUTION** qui agrègent les dimensions (cf. `GRILLE_RADAR_V2.md`). Le `RadarChart` brut (12 dimensions) est réservé aux vues expertes (admin, mentor-certificateur). Le `ComprehensionTable` est la vue porteur, pédagogique et non culpabilisante.

`diagnostics`, `academy` et `certifications` **consomment** `@/features/scoring` ; ils ne réimplémentent jamais le radar. Le `RadarScoreForm` (saisie) n'est rendu que pour les rôles `analyst`/`mentor` lors d'une validation.

### 10bis.2. `payments` — mobile money d'abord ⏳ *(v2)*

> **Différé au MVP (freemium).** Cette section décrit le design de la **v2**. Au MVP, aucune UI de paiement n'est construite. On la conserve ici pour ne pas refondre plus tard.

Le sélecteur de paiement met le **mobile money en premier** (Wave, Orange Money, MTN, Moov), carte en repli. Le point délicat est l'**asynchronisme** : on ne bascule jamais l'UI sur « payé » au retour de redirection.

```tsx
// flux client (simplifié) — v2
const { mutate: checkout } = useCreateCheckout();        // → status pending + instructions
const { data: payment } = usePaymentStatus(paymentId, {  // polling doux
  refetchInterval: (d) => (d?.status === "pending" ? 4000 : false),
});
// UI : "pending" → écran d'attente + instruction (#150#) ;
//      "paid"    → confirmation (déclenchée par le webhook backend, pas par le client) ;
//      "failed"  → réessayer / changer de méthode
```

C'est un **état d'attente assumé dans l'UX**, pas un bug à masquer : en mobile money, l'attente de quelques minutes est la norme régionale.

### 10bis.3. `sprints` — les portes de validation (+ archétype) ⏳ *(Phase Pro)*

Le feature `sprints` rend les livrables comme une **suite de portes**. La liste des livrables attendus dépend de `project.archetype` (digital → wireframes/prototype ; terrain → modèle opérationnel/unit economics ; transverses partout). Chaque livrable affiche son état (`draft` IA / `submitted` / `validated` / `rejected`) et son feedback.

- Côté **porteur** (`dashboard`) : voir, s'approprier, soumettre, lire le feedback.
- Côté **analyste/mentor** (`admin`/`mentor`) : `DeliverableReview` = lecture du livrable + `RadarScoreForm` + valider/rejeter avec feedback.

Un badge de progression « portes franchies : 4/6 » matérialise la condition d'accès à `dossier_delivered`. Le bouton « livrer le dossier » reste masqué tant que les 6 portes ne sont pas vertes — et le backend reste juge (garde §6.1).

### 10bis.4. `certifications` & `mentors` — le double sign-off

L'écran de certification (`admin/projects/[id]/certification`) matérialise le **double sign-off** : deux cartes de signature (analyste + mentor), chacune avec son `RadarScore`. Tant que le quorum n'est pas atteint, le statut affiche « 1/2 — en attente du second regard », et l'action « certifier » est indisponible.

```tsx
// le bouton n'est même pas proposé sans quorum — mais le back reste la barrière
{certification.signoffs.length >= 2
  ? <CertifyButton projectId={id} />
  : <PendingSignoff count={certification.signoffs.length} />}
// tentative prématurée → 422 ErrCertificationIncomplete → toast clair
```

Le feature `mentors` est une **marketplace** à deux niveaux (cf. `ARCHITECTURE_BACKEND.md` §6bis.4) :

- **Côté porteur** (`dashboard/mentors`, MVP) : il **parcourt et choisit** un mentor par secteur, réputation, agenda et honoraires. C'est une expérience de découverte (cartes mentor, filtres, profil détaillé). *La réservation payante et le paiement mentor sont en v2 ; au MVP, on valide la découverte et la mise en relation.*
- **Côté mentor** (`(mentor)`) : profil, secteurs, agenda, honoraires, demandes de coaching reçues.
- **Côté admin** : calibration des **mentors-certificateurs** (le sous-ensemble habilité au sign-off).

```ts
// src/features/mentors/index.ts
export { MentorMarketplace } from "./components/MentorMarketplace"; // porteur : parcourir/choisir
export { MentorProfileCard } from "./components/MentorProfileCard"; // réputation, secteurs, agenda
export { MentorAgenda } from "./components/MentorAgenda";           // côté mentor
export { useMentors, useMentor } from "./api/queries";
```

La **certification** (sign-off) n'est rendue que pour les mentors **certificateurs calibrés** : le `DeliverableReview` et le `CertifyButton` sont masqués pour un mentor marketplace ordinaire. Comme toujours, le front masque, le back interdit (RBAC : `mentor` vs `mentor-certifier`).

---

## 11. Cartographie features → backend → routes

| Feature front | Module backend | Espaces concernés | Routes API · statut |
| :--- | :--- | :--- | :--- |
| `auth` | auth, users | tous | `/auth/*` · ✅ MVP |
| `academy` | academy | dashboard (porteur) | `/academy/*` · ✅ MVP |
| `pitch-simulator` | pitchsim | dashboard (porteur) | `/pitch-sim/*` · ✅ MVP |
| `scoring` | scoring | public, dashboard, admin, mentor | grille + tableau de compréhension · ✅ MVP |
| `diagnostics` | diagnostics | public, dashboard, admin | `/diagnostics/*` (2 flows) · ✅ MVP |
| `projects` | projects (+ archétype) | dashboard, admin | `/projects/*` · ✅ MVP |
| `reports` | reports | dashboard, admin | `/reports/*` (in-app) · ✅ MVP |
| `documents` | documents | tous (auth) | `/documents/*` · ✅ MVP |
| `mentors` | mentors (marketplace) | dashboard, mentor, admin | `/mentors/*` (découverte/choix) · ✅ MVP · booking/paiement ⏳ v2 |
| `notifications` | notifications | (transverse UI) | in-app · ✅ MVP |
| `sprints` | sprints (portes) | dashboard, admin, mentor | `/sprint-*` · ⏳ Phase Pro |
| `certifications` | certifications (double sign-off) | admin, mentor-certif | `/projects/{id}/certification/*` · ⏳ |
| `investors` | investors | admin | `/investors/*` · ⏳ v2 (concierge) |
| `dealflow` | dealflow | investor, admin | `/deal-flow/*` · ⏳ v2 |
| `payments` | payments | dashboard, admin | `/payments/*` · ⏳ v2 (freemium) |
| `signatures` | signatures | dashboard, admin | `/signatures/*` · ⏳ v2 |

Symétrie volontaire avec `internal/<module>` côté Go : un dev qui connaît le backend retrouve le même découpage côté front. Un feature = un module métier, des deux côtés.

---

## 12. Conventions & qualité

- **TypeScript strict** (`strict: true`). Aucun `any` non justifié. Types d'API **générés** (`openapi-typescript`), jamais recopiés.
- **Imports** : alias `@/features/*`, `@/shared/*`. Règle ESLint interdisant l'import des internes d'un feature (barrel obligatoire).
- **Server vs Client** : `"use client"` le plus bas possible. Un composant qui n'a ni état ni handler reste Server.
- **Tests** : Vitest + Testing Library (unitaire composant + logique de `lib/`), Playwright pour les parcours critiques (e2e — partagés avec OPS-01, cf. `CAHIER_RECETTE.md`).
- **Perf** : `next/image`, `next/font`, code-splitting par route automatique, pas de gros store client. Cibler un LCP correct sur les pages publiques (SEO + conversion).
- **Lint/format** : ESLint + Prettier bloquants en CI (DoD `GUIDE.md`).

---

## 13. Exemple de bout en bout — changer le statut d'un projet

Met en jeu toutes les couches du front. Scénario de référence (admin, story IDX-BO-02).

```
1. [app/(admin)/admin/projects/[id]/page.tsx]  (Server Component)
       getProject(id) → fetch serveur vers l'API Go (cookie propagé)
       → passe le projet à <ProjectDetail>

2. [features/projects/components/ProjectDetail]  (compose)
       affiche RadarChart + ProjectTimeline + <ChangeStatusButton>  (Client)

3. [ChangeStatusButton]  (Client Component)
       lit la machine à états CLIENT (lib/status-machine.ts)
       → n'affiche QUE les transitions légales depuis le statut courant (UX)
       can(user, "project.changeStatus") ? bouton actif : masqué

4. clic → useChangeStatus(id).mutate("certified")
       → apiFetch PATCH /projects/{id}/status
       → backend valide la transition (vraie barrière), audit, invalide son cache

5a. succès → onSuccess invalide les query keys → l'UI se rafraîchit (timeline + badge)
            → Toast « Projet certifié »
5b. échec 422 (transition illégale côté serveur) → ApiError → Toast d'erreur clair
            (le front avait masqué le bouton, mais le back reste juge — défense en profondeur)
```

Le front guide l'utilisateur (machine à états miroir, boutons masqués), mais **ne décide jamais** : il propose, le backend dispose. La donnée affichée vient du serveur, l'invalidation React Query garde l'écran cohérent après chaque mutation, et l'enveloppe d'erreur uniforme rend chaque échec lisible sans code spécifique par appel.

---

*Document d'architecture frontend — posture senior, organisation feature-first, mobile-first.*
*Consommateur de l'API Go (`ARCHITECTURE_BACKEND.md`). Couche design dans `CHARTE_FRONTEND.md`. Aligné `PARCOURS_PRODUIT.md`, `SCENARIO_ENTREE.md` (MVP freemium), `GABARIT_GRILLE_RADAR.md` (tableau de compréhension), `BESOINS_*` et la décision mentor-marketplace à deux niveaux.*
*Implémentation de référence de l'onboarding : `onboarding_ideaxion.jsx` (à porter en `features/auth` + `features/investors`).*
*Confidentiel — Ideaxion.*
