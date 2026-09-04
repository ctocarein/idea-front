import { describe, expect, it } from "vitest";

import { filledCount, mergeDrafts, resumeIndex } from "./resume";

/**
 * Reprise d'une saisie interrompue.
 *
 * Deux décisions peuvent faire perdre son travail à un porteur : où le remettre, et quel
 * texte l'emporte quand deux versions existent. Une régression sur l'une ou l'autre est
 * invisible à la relecture et coûteuse à l'usage — d'où ces tests.
 */

const KEYS = ["d1", "d2", "d3", "d4"];

describe("position de reprise", () => {
  it("rouvre la dimension où le porteur s'est arrêté", () => {
    expect(resumeIndex(KEYS, "d3")).toBe(2);
    expect(resumeIndex(KEYS, "d1")).toBe(0);
  });

  it("repart du début quand la dimension n'existe plus", () => {
    // La grille peut avoir changé entre l'abandon et la reprise : mieux vaut recommencer
    // que planter sur un index disparu.
    expect(resumeIndex(KEYS, "d99")).toBe(0);
    expect(resumeIndex([], "d1")).toBe(0);
  });

  it("repart du début sans dimension enregistrée", () => {
    expect(resumeIndex(KEYS, null)).toBe(0);
    expect(resumeIndex(KEYS, undefined)).toBe(0);
    expect(resumeIndex(KEYS, "")).toBe(0);
  });
});

describe("fusion des textes", () => {
  const ai = { d1: "Rédigé par l'IA", d2: "Rédigé par l'IA", d3: "Rédigé par l'IA" };

  it("fait primer ce que le porteur a écrit", () => {
    // L'ordre est le point sensible : inversé, reprendre son brouillon écraserait son
    // propre travail par la proposition initiale — exactement ce que la reprise sauve.
    const merged = mergeDrafts(ai, { d2: "Ce que J'AI écrit" });
    expect(merged.d2).toBe("Ce que J'AI écrit");
  });

  it("garde la proposition de l'IA là où le porteur n'a rien écrit", () => {
    const merged = mergeDrafts(ai, { d2: "mon texte" });
    expect(merged.d1).toBe("Rédigé par l'IA");
    expect(merged.d3).toBe("Rédigé par l'IA");
  });

  it("ne perd aucune dimension", () => {
    expect(Object.keys(mergeDrafts(ai, { d2: "x" })).sort()).toEqual(["d1", "d2", "d3"]);
    expect(mergeDrafts(ai, null)).toEqual(ai);
    expect(mergeDrafts(ai, undefined)).toEqual(ai);
  });

  it("conserve une saisie volontairement vidée", () => {
    // Un porteur qui efface un texte a pris une décision : la reprise doit la respecter,
    // pas y remettre la proposition de l'IA.
    expect(mergeDrafts(ai, { d1: "" }).d1).toBe("");
  });
});

describe("décompte affiché à la reprise", () => {
  it("ne compte que les dimensions réellement renseignées", () => {
    // Le bandeau annonce « 8 sur 12 » : compter des chaînes vides ou blanches mentirait
    // au porteur sur ce qui l'attend.
    expect(filledCount({ d1: "un texte", d2: "", d3: "   ", d4: "autre" })).toBe(2);
    expect(filledCount({})).toBe(0);
    expect(filledCount(null)).toBe(0);
    expect(filledCount(undefined)).toBe(0);
  });
});
