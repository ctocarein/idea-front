import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "./Button";

describe("Button", () => {
  it("rend son libellé", () => {
    render(<Button>Créer mon espace</Button>);
    expect(
      screen.getByRole("button", { name: "Créer mon espace" }),
    ).toBeInTheDocument();
  });

  it("est désactivé et aria-busy en chargement", () => {
    render(<Button loading>Envoyer</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });
});
