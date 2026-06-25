# BESOINS PAR RÔLE — 3. ADMINISTRATEUR

**Expression des besoins, cas par cas · Posture produit · v1.0 · Confidentiel — Ideaxion.**

> Format : *En tant qu'administrateur, je veux… afin de…*. Marqueurs **[MVP]** / **[v2]** (phasage freemium).
>
> **L'admin en une phrase :** le chef d'orchestre — il **cure** (mentors, qualité), **pilote** (projets, parcours), **gouverne** (la grille Radar, le référentiel), **relie** (les projets au capital, en concierge), et surtout, pendant le freemium, il **observe pour comprendre l'enjeu**.

> **Au MVP, l'admin et l'analyste sont souvent la même personne** (toi + ton petit réseau). Les rôles sont distincts dans le design, mais une seule personne porte plusieurs casquettes au démarrage.

---

## Cas 1 — Piloter & comprendre l'enjeu *(le tableau de bord — priorité MVP)*

- **[MVP]** Je veux un **dashboard global** (porteurs, projets, mentors, activité) afin d'avoir une vue d'ensemble en un coup d'œil.
- **[MVP ★]** Je veux un **tableau de bord d'apprentissage** — transformation (Radar avant/après), rétention, signaux de volonté de payer, liquidité — afin de **comprendre l'enjeu** pendant les 12 mois freemium. *(c'est LA raison d'être du freemium : sans ces mesures, 12 mois passent sans rien apprendre.)*
- **[MVP]** Je veux voir la **santé technique** (jobs, erreurs) afin de réagir vite si quelque chose casse.

## Cas 2 — Gérer les mentors *(curation — le garde-fou qualité)*

- **[MVP]** Je veux **examiner une candidature mentor (CV + email)** afin de décider qui rejoint la plateforme.
- **[MVP]** Je veux **créer le compte mentor et déclencher son invitation** afin d'onboarder les profils que je valide.
- **[MVP]** Je veux **activer, suspendre ou refuser** un mentor afin de garder la maîtrise de la qualité.
- **[v2]** Je veux **calibrer les mentors-certificateurs** (test sur cas étalons de la grille) afin de n'habiliter à certifier que ceux qui notent juste — la garde du moat.
- **[v2]** Je veux **suivre la charge et la qualité** des mentors (porteurs suivis, retours) afin de préserver l'expérience.

## Cas 3 — Gérer les porteurs & projets *(pilotage)*

- **[MVP]** Je veux **voir tous les projets et les filtrer** (statut, secteur, catégorie) afin de m'y retrouver.
- **[MVP]** Je veux **voir le détail d'un projet** (diagnostic, Radar, documents) afin de comprendre chaque dossier.
- **[MVP]** Je veux **piloter le cycle de vie d'un projet** (changer le statut, dans les règles) afin de faire avancer le parcours.
- **[MVP]** Je veux **assigner un analyste / proposer un mentor** à un projet afin d'organiser l'accompagnement.
- **[MVP]** Je veux **voir la timeline / l'historique** d'un projet afin de suivre son évolution.

## Cas 4 — Gouverner le référentiel *(la grille Radar)*

- **[MVP]** Je veux **gérer et versionner la grille Radar** afin de faire évoluer le référentiel sans casser l'historique.
- **[MVP]** Je veux **gérer les catégories de projet et leurs jeux de questions** afin que le diagnostic reste pertinent par secteur.
- **[v2]** Je veux **vérifier la cohérence des scores** (humains vs grille) afin de détecter les dérives de notation.

## Cas 5 — Orchestrer la certification *(v2)*

- **[v2]** Je veux **voir les dossiers prêts à certifier** afin de déclencher le double sign-off.
- **[v2]** Je veux **suivre l'état des sign-offs** (qui a signé, quorum atteint) afin de garantir l'intégrité du label.

## Cas 6 — Relier au capital *(concierge au MVP, self-serve en v2)*

- **[MVP — concierge]** Je veux **identifier les projets d'excellence** afin de les présenter à mon réseau.
- **[MVP — concierge]** Je veux **présenter manuellement un projet à des investisseurs** afin d'amorcer la liquidité **à la main**, sans construire la marketplace.
- **[v2]** Je veux **gérer les investisseurs** (comptes, `club_level`) afin d'animer le Club.
- **[v2]** Je veux **traiter les demandes d'intro** afin de fluidifier les mises en relation.

## Cas 7 — Gérer les utilisateurs, la sécurité & la conformité

- **[MVP]** Je veux **voir et gérer les utilisateurs et leurs rôles** afin d'administrer les accès.
- **[MVP]** Je veux **consulter les audit logs** afin de tracer toutes les actions sensibles.
- **[MVP]** Je veux **traiter les demandes RGPD** (export, suppression cascade) afin de respecter les droits des utilisateurs — obligation, pas option.

## Cas 8 — Superviser la technique *(ops)*

- **[MVP léger]** Je veux **voir l'état des jobs et relancer un job échoué** afin d'assurer la fiabilité du traitement asynchrone.
- **[MVP]** Je veux **recevoir une alerte sur incident** (job échoué après retries) afin d'intervenir à temps.
- **[v2]** Je veux **configurer la plateforme** (paramètres, contenus) afin de l'adapter sans redéploiement.

## Cas 9 — Gérer la monétisation *(v2)*

- **[v2]** Je veux **voir les paiements et abonnements** afin de suivre le revenu.
- **[v2]** Je veux **gérer les formules et tarifs** (porteur et investisseur) afin de piloter le modèle économique.

---

## Synthèse — ce que l'admin peut faire, MVP vs v2

| Capacité | MVP (freemium) | v2 |
| :--- | :---: | :---: |
| Dashboard global + **tableau d'apprentissage** ★ | ✅ | |
| Examiner candidature mentor → créer compte → inviter | ✅ | |
| Activer / suspendre / refuser un mentor | ✅ | |
| Voir, filtrer, piloter les projets (statuts, assignation) | ✅ | |
| Gérer & versionner la grille Radar + catégories | ✅ | |
| Présenter un projet à un investisseur (concierge, manuel) | ✅ | |
| Gérer utilisateurs, audit logs, RGPD | ✅ | |
| Superviser jobs, alertes | ✅ (léger) | |
| Calibrer les certificateurs | | ⏳ |
| Orchestrer la certification (double sign-off) | | ⏳ |
| Gérer investisseurs, demandes d'intro, deal flow | | ⏳ |
| Paiements, formules, tarifs | | ⏳ |

---

## Points de vigilance (décisions à prendre)

1. **Le tableau de bord d'apprentissage est LA priorité admin du MVP.** C'est lui qui transforme 12 mois gratuits en compréhension de l'enjeu. À spécifier finement (quels signaux, quelle fréquence) — sinon le freemium ne t'apprend rien.
2. **Une personne, plusieurs casquettes.** Au démarrage, tu es admin **et** analyste **et** concierge investisseur. Le produit doit le permettre sans frictions de rôles — mais l'archi garde les rôles séparés pour quand l'équipe grandira.
3. **Pouvoir = traçabilité.** L'admin peut beaucoup ; **chaque action sensible doit être auditée** (création de compte, changement de statut, suppression). C'est ce qui protège la confiance et la conformité.
4. **Le concierge investisseur est un vrai travail manuel**, pas une feature. Au MVP, c'est **toi** qui relies les projets au capital — la plateforme te donne juste de quoi identifier les bons projets.
5. **RGPD / réglementaire** (zone d'ombre n°6) : l'admin porte la conformité. À sécuriser tôt — droit à l'effacement, et la question de l'agrément d'intermédiation.

---

*Besoins par rôle — 3. Administrateur. Suivants : 4. Analyste · 5. Investisseur.*
*Aligné `PARCOURS_PRODUIT.md`, `SCENARIO_ENTREE.md`, `BESOINS_MENTOR.md`. Confidentiel — Ideaxion.*
