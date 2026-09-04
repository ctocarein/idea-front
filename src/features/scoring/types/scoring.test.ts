import { describe, expect, it } from "vitest";

import {
  maturityLevel,
  overallScore,
  pillarScore,
  reading,
  type MaturityLevel,
  type RadarScore,
} from "./scoring.types";

// Grille v2 : 12 dimensions /10, 4 piliers (3 axes chacun).
const score: RadarScore = {
  gridVersion: "test",
  axes: {
    d1: 8,
    d2: 6,
    d3: 7, // sens → (8+6+7)/3 = 7
    d4: 4,
    d5: 2,
    d6: 3, // viabilite → (4+2+3)/3 = 3
    d7: 6,
    d8: 8,
    d9: 4, // scalabilite → (6+8+4)/3 = 6
    d10: 9,
    d11: 5,
    d12: 7, // execution → (9+5+7)/3 = 7
  },
  overall: 64, // servi par le backend : pondéré par secteur, donc ≠ moyenne simple
};

// Paliers tels que servis par `GET /scoring/grid` — jamais redéfinis dans le front.
const LEVELS: MaturityLevel[] = [
  { key: "idee_brute", label: "Idée brute", min: 0, max: 25, description: "", tone: "fragile" },
  { key: "a_structurer", label: "À structurer", min: 26, max: 45, description: "", tone: "watch" },
  { key: "prometteur", label: "Prometteur", min: 46, max: 60, description: "", tone: "watch" },
  { key: "pre_viable", label: "Pré-viable", min: 61, max: 75, description: "", tone: "good" },
  { key: "business_ready", label: "Business Ready", min: 76, max: 85, description: "", tone: "strong" },
  { key: "investor_ready", label: "Investor Ready", min: 86, max: 100, description: "", tone: "strong" },
];

describe("scoring", () => {
  it("agrège un pilier comme la moyenne de ses axes (/10)", () => {
    expect(pillarScore(score, "sens")).toBe(7);
    expect(pillarScore(score, "viabilite")).toBe(3);
    expect(pillarScore(score, "scalabilite")).toBe(6);
    expect(pillarScore(score, "execution")).toBe(7);
  });

  it("donne une lecture non culpabilisante par palier", () => {
    expect(reading(80).tone).toBe("strong");
    expect(reading(60).tone).toBe("good");
    expect(reading(40).tone).toBe("watch");
    expect(reading(10).tone).toBe("fragile");
  });
});

describe("score global", () => {
  it("diffère de la moyenne simple — c'est pour ça qu'on ne le recalcule pas", () => {
    // Le backend pondère certaines dimensions selon le secteur ; le front n'a pas les
    // poids, donc il ne peut PAS reproduire le nombre. C'est exactement l'écart qui
    // faisait diverger l'écran et le bilan téléchargé.
    expect(overallScore(score)).toBe(58); // moyenne simple : 69/12 → 57.5 → 58
    expect(score.overall).toBe(64); // ce que le backend a réellement calculé
    expect(score.overall).not.toBe(overallScore(score));
  });

  it("reste absent sur un bilan antérieur à l'unification", () => {
    const legacy: RadarScore = { gridVersion: "v2.0.0", axes: score.axes };
    // L'affichage doit rendre « — » dans ce cas, jamais un nombre reconstruit localement.
    expect(legacy.overall ?? null).toBeNull();
  });
});

describe("paliers de maturité", () => {
  it("résout chaque borne dans le bon palier", () => {
    const at = (value: number) => maturityLevel(value, LEVELS)?.key;
    expect(at(0)).toBe("idee_brute");
    expect(at(25)).toBe("idee_brute");
    expect(at(26)).toBe("a_structurer");
    expect(at(45)).toBe("a_structurer");
    expect(at(46)).toBe("prometteur");
    expect(at(60)).toBe("prometteur");
    expect(at(61)).toBe("pre_viable");
    expect(at(75)).toBe("pre_viable");
    expect(at(76)).toBe("business_ready");
    expect(at(85)).toBe("business_ready");
    expect(at(86)).toBe("investor_ready");
    expect(at(100)).toBe("investor_ready");
  });

  it("couvre toute l'échelle 0..100 sans trou", () => {
    for (let value = 0; value <= 100; value++) {
      expect(maturityLevel(value, LEVELS), `palier manquant pour ${value}`).not.toBeNull();
    }
  });

  it("rend null sans paliers plutôt que d'inventer un repli", () => {
    // Un tableau de repli serait une SECONDE définition — précisément le doublon que
    // l'unification a supprimé. Tant que la grille n'est pas chargée, on affiche « — ».
    expect(maturityLevel(50, [])).toBeNull();
  });
});
