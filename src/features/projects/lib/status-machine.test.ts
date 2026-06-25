import { describe, expect, it } from "vitest";

import { nextStatuses, STATUS_LABEL } from "./status-machine";

describe("status-machine", () => {
  it("n'expose que les transitions légales", () => {
    expect(nextStatuses("new_diagnostic")).toEqual(["in_review"]);
    expect(nextStatuses("in_review")).toContain("qualified");
    expect(nextStatuses("in_review")).toContain("rejected");
  });

  it("ne propose aucune transition incohérente depuis 'excellence'", () => {
    expect(nextStatuses("excellence")).not.toContain("new_diagnostic");
  });

  it("a un libellé pour chaque statut", () => {
    expect(STATUS_LABEL.qualified).toBe("Qualifié");
    expect(STATUS_LABEL.excellence).toBe("Excellence");
  });
});
