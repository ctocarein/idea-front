"use client";

import { useMemo, useState } from "react";

import { Chip, toast } from "@/shared/ui";
import { MentorProfileCard } from "./MentorProfileCard";
import { mockMentors, MENTOR_SECTORS, type Mentor } from "../data/mock";

/**
 * Marketplace découverte (côté porteur, MVP) : parcourir et choisir un mentor
 * par secteur. La réservation/paiement est v2 — ici on valide la mise en
 * relation (BESOINS_PORTEUR cas 5).
 */
export function MentorMarketplace() {
  const [sector, setSector] = useState<string | null>(null);

  const mentors = useMemo(
    () =>
      mockMentors
        .filter((m) => m.status === "marketplace")
        .filter((m) => !sector || m.sectors.includes(sector)),
    [sector],
  );

  function request(m: Mentor) {
    toast.success(`Demande envoyée à ${m.name}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip selected={sector === null} onClick={() => setSector(null)}>
          Tous
        </Chip>
        {MENTOR_SECTORS.map((s) => (
          <Chip
            key={s}
            selected={sector === s}
            onClick={() => setSector((cur) => (cur === s ? null : s))}
          >
            {s}
          </Chip>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mentors.map((m) => (
          <MentorProfileCard key={m.id} mentor={m} onRequest={request} />
        ))}
      </div>
    </div>
  );
}
