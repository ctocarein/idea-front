import { describe, expect, it } from "vitest";

import type { components } from "@/shared/api/schema";

import { axesByKey, isActionableLever, nextAnchor, reachedAnchor } from "./anchors";

type GridAxis = components["schemas"]["AxisOut"];

// Ancres réelles de D6 « Modèle économique » (grille radar-v2.1.0).
const D6: GridAxis = {
  key: "d6",
  code: "D6",
  label: "Modèle économique",
  pillar: "viabilite",
  central_question: "",
  guiding_questions: [],
  anchors: [
    { min: 0, max: 4, label: "Absent ou irréaliste" },
    { min: 4, max: 7, label: "Plausible, unit economics non prouvées" },
    { min: 7, max: 9, label: "Revenus crédibles, marge raisonnable" },
    { min: 9, max: 10, label: "Récurrents prouvés, marge saine" },
  ],
};

describe("ancre atteinte", () => {
  it("situe un score dans sa bande, borne haute exclue", () => {
    expect(reachedAnchor(D6, 0)?.label).toBe("Absent ou irréaliste");
    expect(reachedAnchor(D6, 3)?.label).toBe("Absent ou irréaliste");
    // 4 bascule dans la bande suivante : la borne haute est exclue.
    expect(reachedAnchor(D6, 4)?.label).toBe("Plausible, unit economics non prouvées");
    expect(reachedAnchor(D6, 6)?.label).toBe("Plausible, unit economics non prouvées");
    expect(reachedAnchor(D6, 7)?.label).toBe("Revenus crédibles, marge raisonnable");
  });

  it("inclut le maximum dans la bande la plus haute", () => {
    // Sans cette exception, un score parfait ne tomberait dans AUCUNE bande — et le
    // porteur le mieux noté serait le seul à ne rien lire.
    expect(reachedAnchor(D6, 10)?.label).toBe("Récurrents prouvés, marge saine");
  });

  it("rend null sans score ou sans ancres", () => {
    expect(reachedAnchor(D6, null)).toBeNull();
    expect(reachedAnchor({ ...D6, anchors: [] }, 5)).toBeNull();
    expect(reachedAnchor(undefined, 5)).toBeNull();
  });
});

describe("écart au palier suivant", () => {
  it("désigne la bande d'après — c'est « ce qui manque »", () => {
    expect(nextAnchor(D6, 3)?.label).toBe("Plausible, unit economics non prouvées");
    expect(nextAnchor(D6, 3)?.min).toBe(4); // le SEUIL à atteindre, pas la borne haute
    expect(nextAnchor(D6, 6)?.min).toBe(7);
  });

  it("rend null au palier le plus haut", () => {
    // Rien à viser : afficher un objectif vide serait pire que de ne rien afficher.
    expect(nextAnchor(D6, 9)).toBeNull();
    expect(nextAnchor(D6, 10)).toBeNull();
  });

  it("tolère des bandes non triées", () => {
    const shuffled: GridAxis = { ...D6, anchors: [...D6.anchors!].reverse() };
    expect(reachedAnchor(shuffled, 3)?.label).toBe("Absent ou irréaliste");
    expect(nextAnchor(shuffled, 3)?.min).toBe(4);
  });
});

describe("leviers proposables", () => {
  it("n'autorise le CTA que pour les leviers qui mènent quelque part", () => {
    // `academy` et `pitchsim` routent vers des modules démontés : un bouton y renverrait
    // vers rien. La dimension montre alors son écart, sans appel à l'action.
    expect(isActionableLever("document")).toBe(true);
    expect(isActionableLever("mentor")).toBe(true);
    expect(isActionableLever("academy")).toBe(false);
    expect(isActionableLever("pitchsim")).toBe(false);
    expect(isActionableLever(undefined)).toBe(false);
    expect(isActionableLever(null)).toBe(false);
  });
});

describe("indexation des axes", () => {
  it("indexe par clé de dimension", () => {
    expect(axesByKey([D6]).d6.code).toBe("D6");
    expect(axesByKey(undefined)).toEqual({});
  });
});
