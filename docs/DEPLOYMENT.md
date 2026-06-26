# Déploiement du front Ideaxion (staging / production)

Le front est un serveur Next.js 16 (`output: "standalone"`) conteneurisé. Il ne sert
**aucune** clé au navigateur : le BFF (Server Actions / Route Handlers) est la seule couche
qui parle au backend, et les tokens vivent en cookies HttpOnly.

## 1. Variables d'environnement (runtime)

| Variable | Rôle | Exemple staging |
|---|---|---|
| `BACKEND_API_URL` | URL **server-only** du backend FastAPI, **sans** `/api/v1`. | `https://api-staging.ideaxion.app` |
| `NODE_ENV` | `production` en déploiement → cookies `Secure`, devtools off. | `production` |
| `PORT` | Port d'écoute du serveur Node (défaut 3000). | `3000` |

Voir [`.env.staging.example`](../.env.staging.example). Aucune n'est préfixée `NEXT_PUBLIC_`
(rien n'est exposé au client).

## 2. Build de l'image

```bash
docker build -t ideaxion-front:staging .
```

Le `Dockerfile` est multi-stage (deps → build → runner non-root). Le build n'a **pas** besoin
du backend ; `BACKEND_API_URL` est lu au runtime.

## 3. Lancement

```bash
docker run -d --name ideaxion-front -p 3000:3000 \
  -e BACKEND_API_URL=https://api-staging.ideaxion.app \
  -e NODE_ENV=production \
  ideaxion-front:staging
```

> Le conteneur doit pouvoir **résoudre et joindre** `BACKEND_API_URL` (même réseau Docker,
> DNS interne, ou URL publique). En réseau Docker partagé avec le backend, utiliser le nom
> de service (ex. `http://api:8080`).

## 4. CORS (côté backend)

L'origine du front **doit** figurer dans `CORS_ORIGINS` du backend, sinon les appels échouent :

```
CORS_ORIGINS=https://staging.ideaxion.app
```

## 5. Reverse-proxy / TLS

Placer un reverse-proxy (Caddy / Traefik / nginx) devant le conteneur pour le TLS. Les cookies
sont `Secure` en prod → **HTTPS obligatoire** en staging/prod (sinon pas de session).

## 6. Smoke test

1. `GET https://staging.ideaxion.app/` → page de connexion.
2. Login démo « Porteur » → redirection `/dashboard`.
3. Attendre 15 min, naviguer → le **refresh silencieux** renouvelle l'access token (pas de 401).
4. Diagnostic → bilan → simulateur : le flux porteur répond avec de vraies données.
