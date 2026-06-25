import { describe, expect, it } from "vitest";

import { overallScore, pillarScore, reading, type RadarScore } from "./scoring.types";

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
};

describe("scoring", () => {
  it("agrège un pilier comme la moyenne de ses axes (/10)", () => {
    expect(pillarScore(score, "sens")).toBe(7);
    expect(pillarScore(score, "viabilite")).toBe(3);
    expect(pillarScore(score, "scalabilite")).toBe(6);
    expect(pillarScore(score, "execution")).toBe(7);
  });

  it("calcule le score global ramené sur 100", () => {
    // moyenne des 12 axes = 69/12 = 5.75 → *10 = 57.5 → 58
    expect(overallScore(score)).toBe(58);
  });

  it("donne une lecture non culpabilisante par palier", () => {
    expect(reading(80).tone).toBe("strong");
    expect(reading(60).tone).toBe("good");
    expect(reading(40).tone).toBe("watch");
    expect(reading(10).tone).toBe("fragile");
  });
});
