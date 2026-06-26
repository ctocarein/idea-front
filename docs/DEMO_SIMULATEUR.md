# Mémo de démo — Simulateur de pitch « Le Comité silencieux »

> Script pas-à-pas pour une présentation live (Meet, écran partagé). Durée : ~6 min.
> À faire dans **Chrome** (le micro + la voix ont besoin d'audio réel).

---

## 0. Avant la démo (2 min, hors caméra)

> ⚠️ Sur cette machine, un serveur Node tiers occupe le **8080** → on met le backend sur **8081**
> (déjà reflété dans `idea-front/.env.local` : `BACKEND_API_URL=http://127.0.0.1:8081`).

```bash
# Infra (si la machine a veillé, les conteneurs s'arrêtent)
docker start idea-pg idea-back-redis-1 idea-back-minio-1

# Backend (LLM mock = rapide, déterministe, gratuit). UNE seule instance !
cd idea-back
LLM_PROVIDER=mock python -m uvicorn app.main:app --host 127.0.0.1 --port 8081
python -m app.worker          # autre terminal (pour le diagnostic ; le pitch est synchrone)

# Front
cd idea-front && pnpm dev
```

- Vérifier : `http://127.0.0.1:8081/api/v1/health` → `"database":true`.
- En cas de 404 persistants : `Get-Process python | Stop-Process -Force` puis relancer UNE
  seule uvicorn (les instances multiples qui se battent sur le port = la cause).
- Ouvrir le front, **se connecter en « Porteur »** (bouton démo).
- Astuce : avoir **déjà lancé un diagnostic** une fois (le dashboard montre alors un vrai radar — plus parlant).

---

## 1. La phrase d'ouverture (le pourquoi)

> « Le plus dur, ce n'est pas l'argent — c'est de **perdre la peur** de défendre son projet.
> Ici, le porteur s'entraîne face à un **comité virtuel**, autant de fois qu'il veut, sans
> jugement. Et à la fin, il ne reçoit pas un score abstrait : il reçoit **les mots exacts**
> de chaque juge. »

---

## 2. Le parcours (ce qu'on clique → ce qu'on dit)

| # | Action à l'écran | Ce qu'on raconte |
|---|------------------|------------------|
| 1 | **Simulateur → Briefing** : montrer les 3 comités + leurs juges | « Chaque juge a une **obsession** : M. Morel le serial-entrepreneur traque l'irréalisme, Mme Diallo pousse sur l'équipe. » |
| 2 | Choisir un comité → **Entrer dans la salle** | « Règle d'or n°1 : ils **ne te coupent jamais** pendant le pitch — ils réagissent en silence. » |
| 3 | **Commencer mon pitch** → cliquer **« Parler »** et pitcher à voix haute | « Ta voix devient du texte. Et regarde les visages : la **conviction évolue** — neutre → convaincu. Tu *lis* le jury. » |
| 4 | **« J'ai terminé »** → la phase Questions | « Règle d'or n°3 : **un seul juge à la fois**, dans l'ordre. Pas de cacophonie. » |
| 5 | La question **se lit toute seule** (voix du juge) → répondre au **micro** | « Le juge te parle. Tu réponds. Chaque question est **taguée par axe** (équipe, marché…). » |
| 6 | Enchaîner les réponses → **Faire délibérer** | « Les juges se concertent… » |
| 7 | **Post-mortem** : faire défiler les **verdicts verbatim** | **LE moment fort.** « Pas un score abstrait : *“votre croissance n'est qu'un château de cartes”* — signé **M. Morel**, vote *conditional*. Plus radar, forces, plan. » |

---

## 3. Les 3 différenciateurs à marteler

1. **Sans peur, à l'infini, gratuit** — le porteur rejoue autant qu'il veut.
2. **Le verbatim = la monnaie** — le rapport cite chaque juge ; le score « Fond » nourrira le **dealflow B2B**.
3. **Un comité vivant** — conviction qui bouge, expert métier **dynamique** (ex. *Mme Traoré (EdTech)* apparaît selon le secteur du projet).

---

## 4. La couche voix (le « wow » technique, 30 s)

> « Le micro et les voix sont une **couche d'entrée/sortie** par-dessus un moteur 100 % texte.
> Aujourd'hui : Web Speech du navigateur (gratuit). Demain : **Whisper** (STT) + un **vrai TTS**
> (une voix par juge), derrière **consentement RGPD + paywall**. Le cœur ne change pas. »

(Schéma : *Toi → STT → Comité → TTS → Toi*.)

---

## 5. Si ça casse (plan B)

- **Page « non trouvée » / lenteur** → l'infra a flické : `docker start idea-pg idea-back-redis-1 idea-back-minio-1`, recharger.
- **Pas de micro / navigateur sans dictée** → taper au clavier ; montrer quand même le bouton 🔊 (lecture du juge).
- **Filet de sécurité** → garder un onglet sur un **post-mortem déjà généré** (`/dashboard/pitch-sim/<id>?view=report`) pour montrer le verbatim sans dérouler tout le flux.

---

## 6. Phrase de clôture

> « Le diagnostic rend le projet **lisible**, l'Academy le rend **solide**, le simulateur rend le
> porteur **capable et confiant**. Et tout ce qu'il produit — score, verbatim — devient la
> matière que cherchent mentors et financeurs. »
