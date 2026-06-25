# BESOINS PAR RÔLE — 4. ANALYSTE

**Expression des besoins, cas par cas · Posture produit · v1.0 · Confidentiel — Ideaxion.**

> Format : *En tant qu'analyste, je veux… afin de…*. Marqueurs **[MVP]** / **[v2]**.
>
> **L'analyste en une phrase :** le **regard humain interne** d'Ideaxion. Il analyse, qualifie, accompagne et valide les projets **qui lui sont assignés** — avec des pouvoirs **restreints** (pas l'admin). C'est lui qui apporte le jugement humain là où l'IA ne fait que proposer.

> **Phasage honnête.** Au MVP freemium, le rôle analyste est **léger et largement fondu dans l'admin/fondateur** : sa fonction réelle est le **regard humain sur les diagnostics** et la **curation** des bons projets. Sa pleine expression (validation des livrables, sign-off de certification) appartient à la **Phase Pro (v2)**. On ne sur-construit pas une UI analyste séparée au MVP.

---

## Cas 1 — Recevoir et organiser son travail

- **[MVP]** Je veux **voir les projets qui me sont assignés** afin de savoir de quoi je suis responsable.
- **[MVP]** Je veux une **file de travail claire** (à analyser, à valider, en attente) afin de prioriser.
- **[MVP]** Je veux n'accéder **qu'à mes projets assignés** (RBAC strict) afin que le cloisonnement soit respecté.

## Cas 2 — Analyser & qualifier *(le regard humain — fonction MVP clé)*

- **[MVP]** Je veux **accéder au contexte complet d'un projet** (diagnostic, Radar, réponses, documents) afin de l'évaluer en profondeur.
- **[MVP]** Je veux **porter un jugement humain au-delà du score IA** afin de confirmer, nuancer ou corriger ce que l'algorithme a vu.
- **[MVP]** Je veux **scorer / ajuster le projet sur la grille Radar** afin que le regard humain s'exprime dans le même référentiel.
- **[MVP]** Je veux **qualifier un projet** (prometteur / à retravailler / hors cible) afin d'orienter la suite — et notamment **identifier les projets d'excellence** pour la présentation concierge.
- **[MVP]** Je veux **commenter / annoter** un projet afin de garder une trace de mon analyse.

## Cas 3 — Accompagner & donner du feedback

- **[MVP léger]** Je veux **donner un feedback structuré au porteur** afin de l'aider à progresser.
- **[MVP]** Je veux **suivre la progression d'un porteur** (Radar avant/après) afin de mesurer l'effet de l'accompagnement.
- **[v2]** Je veux **échanger / planifier avec le porteur** afin d'accompagner dans la durée.

## Cas 4 — Valider les livrables *(portes — Phase Pro, v2)*

- **[v2]** Je veux **examiner un livrable soumis** (BP, pitch, modèle éco) afin d'évaluer s'il franchit la porte.
- **[v2]** Je veux **le scorer contre la grille Radar** afin que mon évaluation soit cohérente avec le référentiel.
- **[v2]** Je veux **valider ou rejeter avec un feedback** afin que le porteur sache quoi corriger.

## Cas 5 — Participer à la certification *(v2)*

- **[v2]** Je veux **apposer mon sign-off** sur un dossier prêt afin de participer au double regard (souvent **analyste interne + mentor externe**).
- **[v2]** Je veux **engager mon jugement** sur le label afin de garantir son intégrité.

## Cas 6 — Faire avancer le projet *(pouvoirs limités)*

- **[MVP]** Je veux **changer certains statuts autorisés** (pas toute la machine à états) afin de faire avancer mes projets dans mon périmètre.
- **[MVP]** Je veux **proposer un mentor / signaler à l'admin** afin d'organiser la suite sans empiéter sur les droits admin.

## Cas 7 — Contribuer à la qualité du référentiel

- **[MVP/v2]** Je veux **remonter les cas où la grille Radar est ambiguë** afin qu'elle s'améliore (boucle de calibration).
- **[v2]** Je veux **participer aux sessions de calibration** afin que tous les évaluateurs notent de la même façon.

---

## Synthèse — ce que l'analyste peut faire, MVP vs v2

| Capacité | MVP (freemium) | v2 |
| :--- | :---: | :---: |
| Voir ses projets assignés, file de travail | ✅ | |
| Analyser un projet, regard humain sur le diagnostic | ✅ | |
| Scorer/ajuster sur la grille Radar | ✅ | |
| Qualifier + identifier les projets d'excellence (curation) | ✅ | |
| Feedback porteur, suivi de progression | ✅ (léger) | |
| Changer certains statuts (limités) | ✅ | |
| Valider les livrables (portes) | | ⏳ |
| Sign-off de certification | | ⏳ |
| Calibration formelle | | ⏳ |

---

## Points de vigilance (décisions à prendre)

1. **Au MVP, analyste ≈ admin ≈ toi.** Ne construis pas une UI analyste distincte au démarrage : les capacités analyste s'expriment dans les écrans admin/projets, avec un RBAC qui restreint au périmètre assigné. La séparation nette devient utile quand l'équipe grandit (v2).
2. **Analyste (interne) vs mentor (externe) pour la certification.** Le double sign-off est plus crédible s'il combine **un regard interne + un regard externe**. À fixer : la certification exige-t-elle **un analyste ET un mentor-certificateur** (recommandé), ou deux signataires quelconques de rôles distincts ?
3. **Pouvoirs restreints, à cadrer précisément.** L'analyste ne doit pas pouvoir tout faire : définir **exactement** quelles transitions de statut lui sont permises, et quels projets il voit. C'est du RBAC fin, à spécifier.
4. **Le regard humain dès le diagnostic.** Même au MVP, la qualification humaine (Cas 2) est ce qui distingue Ideaxion d'un simple chatbot. C'est l'incarnation de « l'IA propose, l'humain tranche » — y compris à l'entrée, pas seulement à la certification.

---

*Besoins par rôle — 4. Analyste. Suivant : 5. Investisseur.*
*Aligné `PARCOURS_PRODUIT.md`, `BESOINS_ADMINISTRATEUR.md`, `GABARIT_GRILLE_RADAR.md`. Confidentiel — Ideaxion.*
