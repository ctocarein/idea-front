# GUIDE DÉVELOPPEUR — IDEAXION (MVP FREEMIUM)

**Du dossier produit au backlog exécutable.**
Document à destination de l'équipe technique (backend Python / FastAPI, frontend Next.js).
Posture CTO · Version 2.1 — MVP freemium, backend FastAPI · Confidentiel — Ideaxion.

> Ce guide est le **contrat d'exécution** entre la vision produit et le code. Il est aligné sur :
> `PARCOURS_PRODUIT.md` · `SCENARIO_ENTREE.md` · `GABARIT_GRILLE_RADAR.md` · `ARCHITECTURE_BACKEND.md` / `ARCHITECTURE_FRONTEND.md` · `BESOINS_*` ×5 · `CAHIER_RECETTE.md`.
> En cas de contradiction sur le périmètre, ces docs font foi ; sur le **process**, **ce guide fait foi**.
>
> **Mise à jour stack (v2.1) :** le backend est désormais **Python / FastAPI** (et non Go), motivé par la nature IA-centrée du produit (écosystème LLM natif Python, génération OpenAPI automatique via Pydantic). Les décisions structurantes sont conservées et transposées aux idiomes FastAPI (cf. `ARCHITECTURE_BACKEND.md` v2.0). Ce guide a été réaligné en conséquence.

---

## 0. Comment utiliser ce guide

| Vous êtes… | Lisez en priorité |
| :--- | :--- |
| Dev qui démarre | §2 (organisation), §3 (conventions), §4 (mise en route) |
| Dev en cours de sprint | §7 (le sprint en cours), §2.4 / §2.5 (DoR / DoD) |
| Lead / CTO | §6 (backlog), §8 (capacité), §9 (dépendances), §11 (risques), §12 (pré-requis) |

**Codification :** `IDX-<EPIC>-<NN>`. **Estimation :** Fibonacci `1, 2, 3, 5, 8, 13` (complexité, pas durée).

---

## 1. Vision & cadrage du MVP

**Ideaxion rend des talents capables et confiants, puis — pour ceux qui sont prêts — les certifie et les relie au capital.**

La **première douleur n'est pas l'accès au capital, c'est l'impuissance** : comprendre comment ça marche, structurer un BP, monter un pitch, perdre la peur. Le MVP construit ce **moteur de transformation**.

### 1.1. Le MVP est **freemium** (12 mois)

On construit **le moteur de valeur, gratuit**, pour **comprendre l'enjeu et peaufiner le projet** avant de monétiser. Conséquence directe sur le périmètre technique :

| Dans le MVP (gratuit) | Différé en v2 |
| :--- | :--- |
| Diagnostic (2 flows) · Radar & tableau de compréhension · Academy · Simulateur de pitch · Dashboard porteur · Mentor onboarding & découverte · Back-office admin · **Instrumentation d'apprentissage** | Paiement / formules · Signatures · Phase Pro (production livrables, portes) · Certification (double sign-off) · Espace investisseur & deal flow |

> **On ne construit pas `payments`, `signatures`, `dealflow`, `certifications` ni la Phase Pro au MVP.** Le côté investisseur est **concierge** (manuel, par le fondateur). Le découpage des features v2 reste documenté pour ne pas refondre — mais il n'est pas développé.

### 1.2. La métrique nord : la **transformation**, pas le revenu

Le succès du MVP ne se mesure pas en chiffre d'affaires (il est gratuit). Il se mesure en **transformation** : un porteur qui arrive perdu et repart structuré et confiant. L'instrumentation (épic INSTRUM) en fait une donnée : **Radar avant/après**, rétention, signaux d'intention de payer, liquidité naissante. *Sans cette mesure, 12 mois gratuits ne t'apprennent rien.*

### 1.3. Acteurs du MVP

Porteur (cœur) · Mentor (onboarding + découverte) · Analyste (regard humain, souvent fondu dans l'admin) · Administrateur (curation + pilotage + apprentissage). L'**Investisseur** n'a pas d'espace plateforme au MVP (concierge).

### 1.4. Contrainte fondatrice : API-first & mobile-first

Backend FastAPI = seule source de vérité métier, exposée en API REST (OpenAPI généré automatiquement par Pydantic). Next.js consomme. Et le marché est **mobile-first** : tout le parcours porteur est pensé mobile d'abord.

---

## 2. Organisation Agile (Scrum adapté MVP)

### 2.1. Cadre

- Scrum allégé, sprints de **2 semaines**, **6 sprints** MVP (~12 semaines théoriques, **réalistes 14-18** — voir §8).
- Équipe hypothèse : 1 dev backend Python/FastAPI senior + 1 dev fullstack Next.js + CTO/lead à temps partiel. Vélocité recalibrée après S1 (sprint étalon).

### 2.2. Rôles

| Rôle | Responsabilité |
| :--- | :--- |
| **Product Owner** (fondateur) | Priorise, valide les démos, **fournit la grille Radar et les contenus** (voir §12). |
| **CTO / Tech Lead** | Architecture, revues, déblocage, valide la DoD technique. |
| **Dev Backend (Python/FastAPI)** | API, worker, `app/llm`, modèle de données. |
| **Dev Fullstack (Next.js)** | 3 espaces (public, porteur, admin/mentor), intégration API, design system mobile-first. |

### 2.3. Cérémonies

Planning (lundi J1, 1h30) · Daily (15 min) · Refinement (milieu de sprint, 1h) · Review/démo (vendredi J10, 1h) · Rétro (vendredi J10, 45 min).

### 2.4. Definition of Ready (DoR)

1. Valeur métier claire (*En tant que… je veux… afin de…*, rattachée à un `BESOINS_*`).
2. Critères d'acceptation écrits et testables.
3. Dépendances disponibles (clés API LLM, **grille Radar v1**, contenus academy, maquettes).
4. Estimée (≤ 13 pts).
5. Contrat d'API esquissé (route, payload, codes).

### 2.5. Definition of Done (DoD)

1. PR mergée sur `develop`, **≥ 1 revue** approuvée.
2. Tous les CA vérifiés.
3. Tests automatisés **verts** (unitaires backend ; e2e parcours critiques).
4. Couverture backend du module **≥ 70 %**.
5. OpenAPI à jour pour toute route nouvelle/modifiée.
6. Pas de secret en clair ; `.env.example` à jour.
7. Logs structurés + `audit_log` pour toute action sensible.
8. Migration DB **réversible** (up/down) si schéma modifié.
9. **Responsive mobile vérifié** pour tout écran porteur.
10. **Événements d'instrumentation émis** si la story touche le parcours de transformation (cf. INSTRUM).
11. Déployé et vérifié sur **staging**.

---

## 3. Conventions d'ingénierie

Détail dans `ARCHITECTURE_BACKEND.md` (§3-4) et `ARCHITECTURE_FRONTEND.md` (§1, §12). Points fermes :

- **Git** : GitHub Flow enrichi. `main` (prod) / `develop` (staging auto) / `feature/IDX-…`. PR + 1 review + CI verte. Merge squash.
- **Commits** : Conventional Commits (`feat`, `fix`, `chore`, `test`, `docs`, `refactor`, `perf`, `ci`).
- **Python/FastAPI** : `router → service → repository`, jamais de saut de couche. Exceptions métier typées (`AppError`), jamais d'erreur silencieuse. **Tout asynchrone** (SQLAlchemy async + asyncpg, httpx, Redis async) — pas de `Session` HTTP dans le repo. `ruff` + `mypy` (strict) bloquants. Mock des externes derrière des protocoles/interfaces, injectés par `Depends`.
- **`app/llm`** : tout appel IA passe par le protocole `LLMProvider` (DeepSeek/Mistral par défaut, `factory` par config). Jamais d'appel SDK en dur dans le métier.
- **Next.js** : App Router, Server Components par défaut, **feature-first** (`src/features/*`, barrel), types **générés** depuis l'OpenAPI, TS strict, **mobile-first**.
- **API** : préfixe `/api/v1`, OpenAPI source de vérité (générée par Pydantic, même PR), enveloppe d'erreur uniforme.
- **Stockage** : S3-compatible via `app/documents` (client `minio`) — **MinIO** au MVP. Presigned upload/download.
- **Résilience** : tout I/O externe = timeout + retry + circuit breaker + dégradation. DoD implicite des stories d'intégration.

---

## 4. Mise en route (Getting Started)

```bash
git clone <repo> ideaxion && cd ideaxion
cp .env.example .env          # clés LLM (DeepSeek/Mistral), MinIO, JWT… (voir §12)
docker compose up -d          # postgres, redis, minio, api, worker, frontend
make migrate                  # migrations DB
make seed                     # comptes de démo par rôle + grille Radar v1
```

| Service | URL locale |
| :--- | :--- |
| Frontend Next.js | http://localhost:3000 |
| API FastAPI | http://localhost:8080 |
| Swagger | http://localhost:8080/api/v1/docs |
| Health | http://localhost:8080/api/v1/health |
| MinIO console | http://localhost:9001 |
| PostgreSQL / Redis | localhost:5432 / 6379 |

Comptes de seed : `admin@`, `analyst@`, `mentor@`, `founder@` `ideaxion.test`.

---

## 5. Rappel architecture (référence rapide)

```
[Next.js mobile-first] --REST--> [FastAPI app.main] --+--> [PostgreSQL]
                                                      +--> [Redis] (cache, rate-limit, sessions)
                                                      +--> [app.worker] <-- table `jobs` (SKIP LOCKED)
                                                      +--> [MinIO] (presigned, S3-compatible)
                                                      +--> [app/llm] (DeepSeek/Mistral/OpenAI — factory)
```

Modules backend MVP : `iam` (auth + users + RBAC), `onboarding`, `projects`, `scoring`, `diagnostics`, `reports`, `academy`, `pitchsim`, `mentors`, `documents`, `notifications`, `jobs`, `audit`, `platform`, `llm`. *(L'auth et les users sont regroupés dans `app/iam` côté FastAPI — cf. `ARCHITECTURE_BACKEND.md` §5.)*
Référentiel d'évaluation : la **grille Radar v2** (12 dimensions D1-D12 / 4 piliers, notées /10, versionnée) — voir `GRILLE_RADAR_V2.md` (+ `RAPPORT_PREDIAGNOSTIC.md` pour le livrable).

---

## 6. Backlog produit — Épics

| Code | Épic | Modules | Sprint |
| :--- | :--- | :--- | :--- |
| **FND** | Fondations / Socle | app/core (config, database, logging) | S1 |
| **AUTH** | Authentification & RBAC (4 rôles) | iam (auth + users) | S1 |
| **DS** | Design system & layouts (mobile-first) | (frontend) | S1 |
| **LLM** | Couche IA multi-provider | app/llm | S2 |
| **SCORING** | Radar de Collision + tableau de compréhension | scoring | S2 |
| **DIAG** | Diagnostic (2 flows, catégories, bilan) | diagnostics, reports | S2 |
| **JOB** | Worker & file de jobs | jobs, worker | S2 |
| **ACADEMY** | Apprendre (modules, progression, construire guidé) | academy | S3 |
| **DASH** | Dashboard porteur & readiness | (frontend) | S3 |
| **DOC** | Documents (upload presigned) | documents | S3 |
| **OPP** | Espace opportunités (éligibilité déterministe) | opportunities | S3 |
| **PITCHSIM** | Simulateur de pitch | pitchsim | S4 |
| **MENTOR** | Onboarding mentor & marketplace découverte | mentors | S5 |
| **ADMIN** | Back-office admin (curation, pilotage, grille) | projects, audit | S5 |
| **INSTRUM** | Instrumentation & tableau d'apprentissage | (transverse) | S6 |
| **OPS** | Tests, sécurité, RGPD, monitoring, prod | (transverse) | S6 |

**Déférés en v2 (documentés, non développés) :** PAY (paiement/formules) · SIGN (signatures) · SPRINT (Phase Pro, portes) · CERTIF (double sign-off) · INV/DEALFLOW (espace investisseur).

### Vue épics → valeur

- **S1 (FND+AUTH+DS)** : socle, 100 % bloquant, peu visible.
- **S2 (LLM+SCORING+DIAG+JOB)** : premier moment de valeur — *un porteur comprend son projet*.
- **S3 (ACADEMY+DASH+DOC+OPP)** : *le porteur apprend, progresse et **devient visible*** (orientation vers les opportunités pour lesquelles son score le rend éligible).
- **S4 (PITCHSIM)** : *le porteur s'exerce et perd la peur* — la pièce maîtresse de la transformation.
- **S5 (MENTOR+ADMIN)** : curation humaine et pilotage.
- **S6 (INSTRUM+OPS)** : *on mesure la transformation* et on met en prod.

---

## 7. Plan de sprints détaillé

> Chaque story : **Critères d'acceptation (CA)** et **Tâches techniques (T)**. `[pts]` = estimation.

---

### SPRINT 1 — Socle (Semaines 1-2)

**🎯 Objectif :** fondation déployable sur staging — repo, Docker (+ MinIO), API FastAPI, PostgreSQL migrée, auth JWT + RBAC 4 rôles, squelette Next.js mobile-first avec design system et layouts. *Démo : se connecter via l'API avec 4 rôles et voir le bon espace.*

#### IDX-FND-01 — Dépôt & environnement Docker `[5]`
*En tant que* dev, *je veux* lancer toute la stack en une commande *afin de* démarrer en < 15 min.
- **CA :** `docker compose up -d` démarre frontend, api, worker, postgres, redis, **minio**. `/health` → 200. `.env.example` complet. CI minimale (lint+build+test).
- **T :** docker-compose ; Dockerfiles api/worker/frontend ; service MinIO ; Makefile (`migrate`, `seed`, `test`, `lint`) ; README.

#### IDX-FND-02 — DB, migrations, logger `[3]`
- **CA :** `Alembic` up/down (réversible) ; engine SQLAlchemy async + asyncpg ; logger JSON structuré (structlog) ; `app/core/config` (pydantic-settings) fail-fast.
- **T :** `app/core/database`, `app/core/logging`, `app/core/config` ; migration extensions + ENUM.

#### IDX-FND-03 — Health check `[2]`
- **CA :** `GET /health` agrège DB, Redis, MinIO → 200/503.

#### IDX-FND-04 — Schéma de données MVP `[5]`
*En tant que* dev, *je veux* le schéma du périmètre MVP en base.
- **CA :** tables MVP créées (users, projects, diagnostics, reports, scoring_grids, academy_lessons, learning_progress, practice_sessions, mentors, documents, audit_logs, jobs) avec FK, ENUM, index ; migrations réversibles ; seed par rôle + **grille Radar v1**.
- **T :** migrations ; `make seed` (comptes + grille).

#### IDX-AUTH-01 — Inscription & login (Argon2id + JWT) `[5]`
- **CA :** `POST /auth/register`, `/auth/login` ; Argon2id ; access token JWT 15 min ; erreurs uniformes.
- **T :** `app/iam` (router/service/repository, schémas Pydantic) ; validation ; tests.

#### IDX-AUTH-02 — Refresh token & logout `[3]`
- **CA :** refresh 30 j haché, cookie HttpOnly Secure ; `/auth/refresh`, `/auth/logout` ; `GET/PATCH /auth/me` ; session Redis.

#### IDX-AUTH-03 — Middleware RBAC (4 rôles) `[5]`
- **CA :** rôles `founder`, `mentor`, `analyst`, `admin` (rôle `investor` **préparé**, non actif) ; modèle hybride rôle + permissions explicites (grants) ; vérif permission + propriété de ressource ; 403 ; tests des cas 403.
- **T :** dépendances FastAPI `get_current_user` / `require(...)` (JWT + permissions) ; garde-fous d'autorisation par ressource (`app/iam/dependencies.py`).

#### IDX-AUTH-04 — Rate limiting & headers sécurité `[3]`
- **CA :** 5 tentatives/15 min par email ; rate limit IP/token Redis ; CORS liste blanche ; CSP/X-Frame-Options.

#### IDX-DS-01 — Design system mobile-first `[5]`
- **CA :** composants de base (Button, Input, Select, Textarea, Checkbox, Modal, Toast, Badge, Card, Table, FileUpload) ; tokens ; **responsive mobile d'abord** ; page de démo.
- **T :** Next 14 App Router + TS strict + ESLint/Prettier ; couche `lib/api` typée ; feature-first scaffolding.

#### IDX-DS-02 — Layouts & routing des espaces `[3]`
- **CA :** layouts public, `(dashboard)` porteur, `(admin)`, `(mentor)` ; redirection selon rôle après login ; gardes d'auth front + `middleware.ts`.

**Total Sprint 1 : 39 pts** — *sprint étalon, recalibre §8.*

---

### SPRINT 2 — Diagnostic & Radar : « comprendre son projet » (Semaines 3-4)

**🎯 Objectif :** un porteur passe le diagnostic (idée guidée **ou** upload), l'IA + la grille Radar produisent son **tableau de compréhension** (essence/viabilité/scalabilité) + un bilan PDF, visible dans son dashboard (pas d'email). *Démo : diagnostic de bout en bout → tableau de compréhension + PDF dans l'espace porteur.*

#### IDX-LLM-01 — Couche `app/llm` multi-provider `[5]`
*En tant que* système, *je veux* une interface IA unique et économique.
- **CA :** protocole `LLMProvider` (`complete`, `analyze_json`) ; providers DeepSeek/Mistral (compatibles OpenAI) ; `factory` par config/tâche ; timeout + circuit breaker + fallback (`app/core/resilience`).
- **T :** `app/llm` ; config provider (env) ; parsing JSON strict (Pydantic) ; tests avec provider mocké.

#### IDX-SCORING-01 — Grille Radar versionnée `[5]`
*En tant que* système, *je veux* le référentiel d'évaluation en base.
- **CA :** `scoring_grids` (**12 dimensions D1-D12 / 4 piliers, /10**, ancres, `version`) chargée au seed depuis la grille v2 ; `GET /scoring/grid` ; un score = `{ grid_version, axes, computed_by }`.
- **T :** `app/scoring` ; structures ; mapping catégories ↔ pondération.

#### IDX-SCORING-02 — Tableau de compréhension (4 piliers) `[3]`
- **CA :** rendu des 12 dimensions en **4 piliers : SENS / VIABILITÉ / SCALABILITÉ / EXÉCUTION** (cf. `GRILLE_RADAR_V2.md`) ; composant `ComprehensionTable` (vue porteur) + `RadarChart` (vue experte, 12 axes).
- **T :** feature `scoring` front ; agrégation axes → lentilles.

#### IDX-DIAG-01 — Diagnostic flow A (idée guidée) `[5]`
*En tant que* porteur, *je veux* écrire mon idée et répondre à des questions adaptées à ma catégorie.
- **CA :** choix de catégorie → jeu de questions ; `POST /diagnostics` crée projet (`new_diagnostic`) + diagnostic ; consentement RGPD requis.
- **T :** `app/diagnostics` ; questions par catégorie ; transaction + audit.

#### IDX-DIAG-02 — Diagnostic flow B (upload + extraction) `[5]`
*En tant que* porteur, *je veux* uploader mon projet déjà écrit.
- **CA :** upload presigned MinIO → extraction texte → même pipeline de scoring ; tolérance aux formats (PDF/DOCX).
- **T :** extraction ; route `/diagnostics/upload` ; gestion des formats sales (best-effort + message).

#### IDX-JOB-01 — Worker & file de jobs (SKIP LOCKED) `[8]`
- **CA :** worker consomme `jobs` via `FOR UPDATE SKIP LOCKED` ; statuts + retry backoff 1/5/15 min (max 3) ; priorité.
- **T :** `app/worker.py` ; boucle polling (asyncio) ; registry de handlers.

#### IDX-DIAG-03 — Génération du bilan (analyse + scoring + PDF) `[8]`
*En tant que* porteur, *je veux* recevoir mon bilan structuré.
- **CA :** job `generate_bilan` : `app/llm` analyse + score Radar → `ComprehensionTable` + **PDF** (HTML/CSS) → MinIO ; `reports.status = ready` ; **visible au dashboard, aucun email** ; timeout + dégradation (fallback différé si LLM down).
- **T :** `app/reports` ; génération PDF (HTML/CSS → PDF) ; presigned download ; notification in-app.

**Total Sprint 2 : 39 pts.**

---

### SPRINT 3 — Academy & Dashboard : « apprendre et progresser » (Semaines 5-6)

**🎯 Objectif :** le porteur dispose d'un dashboard d'apprentissage, suit des modules pédagogiques, construit sa propre version guidé par l'IA, gère ses documents, et voit sa readiness. *Démo : un porteur lit un module, construit une section de BP guidé, et voit sa progression Radar.*

#### IDX-ACADEMY-01 — Modules pédagogiques `[5]`
*En tant que* porteur, *je veux* comprendre comment se structure un BP / pitch / modèle éco.
- **CA :** `GET /academy/lessons`, lecture par module ; contenu en base (`academy_lessons`) ; responsive mobile.
- **T :** `app/academy` ; feature `academy` front ; rendu contenu.

#### IDX-ACADEMY-02 — Progression & suivi `[3]`
- **CA :** `learning_progress` par porteur ; modules complétés ; `GET /academy/progress`.

#### IDX-ACADEMY-03 — Construire guidé (assistant IA) `[8]`
*En tant que* porteur, *je veux* monter ma propre version, guidé — **je** écris, l'IA explique.
- **CA :** assistant conversationnel (`app/llm`, modèle bon marché) section par section ; **le porteur reste l'auteur** (pas de génération « clé en main ») ; sauvegarde brouillon.
- **T :** sessions guidées ; garde-fous anti-production complète (frontière gratuit, cf. `BESOINS_PORTEUR` pt 1).

#### IDX-DASH-01 — Dashboard porteur (hub) `[5]`
- **CA :** vue d'ensemble : bilan, **Radar boussole**, progression academy, état du projet ; mobile-first.
- **T :** feature `dashboard` ; composition des features (scoring, academy, reports).

#### IDX-DASH-02 — Page readiness `[5]`
*En tant que* porteur, *je veux* réaliser où j'en suis et décider.
- **CA :** synthèse progression + « ce qu'il me reste pour être prêt » (déf. Radar) ; CTA Phase Pro **non agressif** (invitation, pas injonction). *(la Phase Pro elle-même est v2 ; ici seulement la prise de conscience + l'expression d'intérêt — signal d'instrumentation.)*

#### IDX-DOC-01 — Upload documents (presigned MinIO) `[5]`
- **CA :** `POST /documents/upload-url` (presigned 5 min) → upload direct MinIO → `confirm-upload` ; ≤ 20 Mo ; types autorisés ; `GET /projects/{id}/documents`, `DELETE`.

#### IDX-OPP-01 — Espace opportunités (orientation / visibilité) `[5]`
*En tant que* porteur, *je veux* voir **pour quelles opportunités je suis prêt** (et ce qu'il me manque) *afin de* viser les bonnes (concours, hackathons, incubateurs, mentorat).
- **CA :** `opportunities` (catalogue curé : type, critères d'éligibilité) ; `GET /opportunities` filtré par **éligibilité DÉTERMINISTE** (`score + niveau d'avancement D11 + secteur + review_status` — **réutilise le moteur de routage `next_actions`**, pas de LLM) ; affiche « ce qu'il te manque pour viser plus haut » ; **expression d'intérêt** → événement (`opportunity_interest`).
- **T :** `/internal/opportunities` ; moteur d'éligibilité partagé avec `scoring/actions` ; feature `opportunities` front.

> **Positionnement.** C'est la « visibilité » du porteur — la face amont du pont B2B (pré-incubateur). L'espace investisseur reste **v2** ; ici on n'expose les opportunités qu'**au porteur**.

**Total Sprint 3 : 36 pts.**

---

### SPRINT 4 — Simulateur de pitch : « s'exercer et perdre la peur » (Semaines 7-8)

**🎯 Objectif :** la pièce maîtresse de la transformation. Le porteur s'entraîne face à une IA qui joue l'investisseur, reçoit un feedback sur le Radar, rejoue à volonté, et voit ses progrès. *Démo : une session de pitch complète → feedback Radar → rejeu → progression visible.*

> Sprint volontairement **plus léger en points** : le simulateur est la story la plus **novatrice et risquée** (qualité conversationnelle). On garde de la marge pour itérer sur les prompts et l'UX.

#### IDX-PITCHSIM-01 — Moteur de session conversationnelle `[8]`
*En tant que* porteur, *je veux* pitcher face à une IA-investisseur qui pose les vraies questions.
- **CA :** session (`practice_sessions`) ; `app/llm` joue l'investisseur (prompt versionné, questions difficiles, ton exigeant mais bienveillant) ; `POST /pitch-sim/start`, `/pitch-sim/{id}/turn` ; sans jugement, sans enjeu.
- **T :** `app/pitchsim` ; orchestration conversationnelle ; persistance des tours.

#### IDX-PITCHSIM-02 — Feedback structuré sur le Radar `[5]`
- **CA :** en fin de session, feedback scoré sur les **12 dimensions** (réutilise `scoring`) + points forts / à travailler ; stocké (`pitch_feedback`).
- **T :** prompt d'évaluation ; mapping → Radar ; rendu `PitchFeedbackPanel`.

#### IDX-PITCHSIM-03 — Rejeu & historique `[3]`
- **CA :** rejouer autant de fois ; historique des sessions ; `GET /pitch-sim/sessions`.

#### IDX-PITCHSIM-04 — Progression (boussole avant/après) `[3]`
- **CA :** courbe de progression des scores de pitch dans le temps ; intégrée au dashboard.

#### IDX-DASH-03 — Intégration simulateur au dashboard (UX mobile) `[3]`
- **CA :** entrée claire vers le simulateur ; expérience **mobile fluide** (chat tap-friendly) ; états de chargement soignés.

**Total Sprint 4 : 22 pts.**

---

### SPRINT 5 — Mentors & Back-office admin (Semaines 9-10)

**🎯 Objectif :** onboarder des mentors (candidature CV+email → compte créé par l'admin), les rendre découvrables par les porteurs, et donner à l'admin de quoi curer et piloter. *Démo : l'admin crée un compte mentor depuis une candidature ; un porteur parcourt et choisit un mentor ; l'admin pilote un projet.*

#### IDX-MENTOR-01 — Candidature & création de compte par l'admin `[5]`
*En tant qu'*expert, *je veux* soumettre CV + email ; *en tant qu'*admin, *je veux* créer le compte.
- **CA :** `POST /mentors/apply` (CV via presigned + email) ; `/admin/mentor-applications` ; **admin crée le compte** → invitation à compléter le profil ; statut candidature `pending/accepted/rejected` ; audit.
- **T :** `app/mentors` ; stockage CV (MinIO) ; flux invitation.

#### IDX-MENTOR-02 — Profil mentor `[5]`
- **CA :** secteurs, bio/credentials, **agenda/disponibilités**, **honoraires** (champ, non facturé au MVP), statut (`marketplace`) ; `GET/PATCH /mentors/me`.

#### IDX-MENTOR-03 — Marketplace découverte (côté porteur) `[5]`
*En tant que* porteur, *je veux* parcourir et choisir un mentor.
- **CA :** `GET /mentors` filtrable (secteur) ; fiche mentor (réputation = **badge « vérifié »** au MVP) ; demande de mise en relation `POST /mentors/{id}/request` ; *(réservation/paiement = v2)*.
- **T :** feature `mentors` front (MentorMarketplace, MentorProfileCard).

#### IDX-ADMIN-01 — Back-office projets (liste, détail, pilotage) `[8]`
*En tant qu'*admin, *je veux* voir, filtrer et piloter les projets.
- **CA :** `GET /projects` filtré (statut, secteur, catégorie) ; détail (diagnostic, Radar, documents) ; `PATCH /projects/{id}/status` transitions contrôlées + audit ; assignation analyste/mentor.
- **T :** `app/projects` (machine à états MVP) ; vues admin ; FilterBar, StatusBadge.

#### IDX-ADMIN-02 — Curation mentors & gouvernance grille `[5]`
- **CA :** activer/suspendre/refuser un mentor ; gérer & **versionner la grille Radar** + catégories ; `/admin/mentors`, `/admin/scoring-grid`.

#### IDX-ADMIN-03 — Audit logs & timeline `[3]`
- **CA :** `GET /projects/{id}/timeline` ; module audit générique ; `GET /admin/audit-logs`.

**Total Sprint 5 : 31 pts.**

---

### SPRINT 6 — Instrumentation, sécurité, RGPD & prod (Semaines 11-12)

**🎯 Objectif :** rendre le freemium **apprenant** (le tableau de bord d'apprentissage), durcir, rendre conforme, et déployer. *Démo : le dashboard d'apprentissage montre la transformation des porteurs ; les scénarios de recette passent ; la prod est en ligne.*

#### IDX-INSTRUM-01 — Tableau de bord d'apprentissage ★ `[8]`
*En tant qu'*admin, *je veux* mesurer ce que le freemium doit m'apprendre.
- **CA :** captation d'événements clés (diagnostic fait, modules, pitchs joués, readiness atteinte, intérêt Phase Pro) ; dashboard : **transformation (Radar avant/après)**, rétention, **signaux d'intention de payer**, liquidité naissante ; `GET /admin/learning-dashboard`.
- **T :** couche d'événements ; agrégations ; vues. *Prioritaire : c'est la raison d'être du freemium.*

#### IDX-OPS-01 — Tests de recette `[5]`
- **CA :** scénarios MVP du `CAHIER_RECETTE` (diagnostic 2 flows, academy, simulateur, fallback LLM, RBAC 403, RGPD) automatisés/scriptés ; couverture backend ≥ 70 %.
- **T :** e2e Playwright ; tests d'intégration API ; rapport de recette.

#### IDX-OPS-02 — Durcissement sécurité `[5]`
- **CA :** HTTPS, CORS, headers, validation/sanitization, rate limiting effectif, audit complet ; **tests 401/403 exhaustifs** (cloisonnement porteurs/mentors).

#### IDX-OPS-03 — Conformité RGPD `[5]`
- **CA :** export JSON des données utilisateur ; droit à l'effacement (**suppression cascade** projet/diagnostics/documents + objets MinIO) ; transactionnel.

#### IDX-OPS-04 — Monitoring & supervision jobs `[3]`
- **CA :** Sentry (erreurs) + métriques ; `GET /admin/jobs` + relance ; alerte sur job échoué après retries.

#### IDX-OPS-05 — CI/CD & mise en production `[5]`
- **CA :** push `develop` → staging auto ; merge `main` → prod ; environnements opérationnels ; health post-déploiement ; domaine + sous-domaine staging.

**Total Sprint 6 : 31 pts.**

---

## 8. Capacité & vélocité

| Sprint | Périmètre | Points |
| :--- | :--- | ---: |
| S1 | Socle (FND, AUTH, DS) | 39 |
| S2 | Diagnostic & Radar (LLM, SCORING, DIAG, JOB) | 39 |
| S3 | Academy & Dashboard (ACADEMY, DASH, DOC) | 31 |
| S4 | Simulateur de pitch (PITCHSIM) | 22 |
| S5 | Mentors & Admin (MENTOR, ADMIN) | 31 |
| S6 | Instrumentation, Sécurité, RGPD, Prod (INSTRUM, OPS) | 31 |
| **Total MVP** | | **193** |

**Lecture honnête.** ~193 pts en 12 semaines à 2 devs est **tendu** mais plus réaliste que l'ancien périmètre (on a retiré paiement/signature/deal flow). Si la vélocité observée fin S1 est < 32 pts, **re-planifier sur 14-18 semaines**. Deux postes à risque d'estimation : le **simulateur de pitch** (qualité conversationnelle) et le **construire guidé** (frontière gratuit/payant). **Règle d'or :** on réduit le périmètre, jamais la DoD.

---

## 9. Matrice de dépendances

```
FND-01/02/04 (socle + DB + grille Radar seedée)
   └─> AUTH-01..04 (auth/RBAC 4 rôles) ──> DS-02 ──> tout le front authentifié
LLM-01 (app/llm) ──> DIAG-03 (bilan), ACADEMY-03 (construire guidé), PITCHSIM-01/02
SCORING-01 (grille) ──> SCORING-02 (tableau), DIAG-03, PITCHSIM-02  [grille = chemin critique]
JOB-01 (worker) ──> DIAG-03 (génération asynchrone)
DIAG-01/02 ──> DASH-01 (le dashboard part du bilan)
Tout ──> INSTRUM-01 (capter les événements de transformation) ──> OPS-01 (recette)
```

Points de vigilance :
- **La grille Radar v1 est un pré-requis bloquant de S2** (elle vient de tes ateliers, pas du code — voir §12).
- **Le coût LLM** : router academy/simulateur (volume) sur le provider bon marché ; sinon le freemium n'est pas viable.
- **INSTRUM doit capter les événements *dès* qu'ils existent** : prévoir l'émission des événements dans les stories S2-S5, pas seulement en S6.

---

## 10. Pré-requis avant le Sprint 1

- [ ] **Grille Radar v2** issue de tes ateliers (12 dimensions / 4 piliers, /10, **ancres**, poids par catégorie, questions) — *bloquant pour S2* ; base pré-remplie dans `GRILLE_RADAR_V2.md`.
- [ ] **Catégories de projet** définies (+ jeux de questions).
- [ ] **Trame de contenus Academy** (modules : BP, pitch, modèle éco).
- [ ] Comptes & clés API : **provider LLM** (DeepSeek/Mistral), + fallback éventuel.
- [ ] **MinIO** (ou bucket S3-compatible) + credentials.
- [ ] Accès repo Git + droits CI/CD ; domaine + sous-domaine `staging`.
- [ ] Direction graphique **mobile-first** pour le design system.

> **NON requis au MVP** (déférés v2) : Stripe/mobile money, Yousign, comptes investisseurs, SerpAPI.

---

## 11. Risques & mitigations

| Risque | Impact | Prob. | Mitigation |
| :--- | :--- | :--- | :--- |
| Grille Radar non prête à temps | Bloque S2 | Élevée | La produire **avant** S1 (ateliers réseau) ; bloquant pré-requis. |
| Qualité IA insuffisante (diagnostic/simulateur creux) | Perte de confiance | Élevée | Grille humaine + prompts versionnés + pilote manuel ; arbitrer coût/qualité par tâche. |
| Coûts LLM qui dérapent | Budget | Moyenne | Provider bon marché (DeepSeek/Mistral) + routage + suivi conso. |
| Frontière gratuit/payant floue (construire guidé) | Cannibalisation future | Moyenne | Cadrer « apprendre à faire » (gratuit) vs « faire avec toi » (v2). |
| Simulateur sous-estimé | Glissement S4 | Moyenne | S4 volontairement léger ; itération prompts. |
| Freemium sans apprentissage | 12 mois perdus | Élevée | INSTRUM prioritaire ; événements émis dès S2. |
| Résidence données (LLM hors UE) | Confiance/RGPD | Moyenne | Mistral (UE) ou DeepSeek routé hors-Chine pour données sensibles. |

---

## 12. Livrables MVP attendus

- [ ] Code backend Python/FastAPI + frontend Next.js (repos).
- [ ] Schéma PostgreSQL + migrations réversibles.
- [ ] OpenAPI/Swagger exposée.
- [ ] README + docker-compose (avec MinIO).
- [ ] `.env.example` complet.
- [ ] Grille Radar v1 intégrée (seed).
- [ ] Contenus Academy v1.
- [ ] Tableau de bord d'apprentissage opérationnel.
- [ ] Rapport de recette.
- [ ] Accès staging + production.

---

*Guide rédigé en posture CTO — du dossier produit vers l'exécution du MVP freemium.*
*La mission d'abord : rendre des talents capables et confiants. La monétisation vient après, prouvée. Confidentiel — Ideaxion.*
