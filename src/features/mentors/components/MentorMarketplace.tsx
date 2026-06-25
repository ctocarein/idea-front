"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Heart } from "lucide-react";

import { Button, Card, CardContent, Chip, toast } from "@/shared/ui";
import { requestMentor } from "../actions";
import type { MentorPublic } from "../api";

/**
 * Marketplace découverte (côté porteur, MVP) : parcourir et choisir un mentor par secteur.
 * La mise en relation (gratuite) crée une demande (BESOINS_PORTEUR cas 5). Données réelles.
 */
export function MentorMarketplace({
  mentors,
  projectId,
}: {
  mentors: MentorPublic[];
  projectId: string | null;
}) {
  const [sector, setSector] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const sectors = useMemo(
    () => [...new Set(mentors.flatMap((m) => m.sectors as string[]))].sort(),
    [mentors],
  );
  const filtered = sector
    ? mentors.filter((m) => (m.sectors as string[]).includes(sector))
    : mentors;

  function request(mentor: MentorPublic) {
    if (!projectId) {
      toast.error("Lance d'abord ton diagnostic pour solliciter un mentor.");
      return;
    }
    startTransition(async () => {
      const res = await requestMentor(
        mentor.user_id,
        projectId,
        "Bonjour, j'aimerais être accompagné·e sur mon projet.",
      );
      if (res.ok) {
        setRequested((s) => new Set(s).add(mentor.user_id));
        toast.success("Demande envoyée ✦");
      } else {
        toast.error(res.message);
      }
    });
  }

  if (mentors.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Aucun mentor disponible pour le moment. Reviens bientôt — la communauté grandit.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {sectors.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <Chip selected={sector === null} onClick={() => setSector(null)}>
            Tous secteurs
          </Chip>
          {sectors.map((s) => (
            <Chip
              key={s}
              selected={sector === s}
              onClick={() => setSector((cur) => (cur === s ? null : s))}
            >
              {s}
            </Chip>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((m) => {
          const done = requested.has(m.user_id);
          return (
            <Card key={m.user_id}>
              <CardContent className="flex h-full flex-col gap-3 pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-dawn font-display text-base font-bold text-ink">
                    {m.full_name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-display font-bold">{m.full_name}</p>
                    <p className="text-xs text-muted-foreground">{m.sectors.join(" · ")}</p>
                  </div>
                </div>
                {m.bio ? (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{m.bio}</p>
                ) : null}
                <div className="mt-auto pt-1">
                  {done ? (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-success">
                      <CheckCircle2 className="size-4" />
                      Demande envoyée
                    </span>
                  ) : (
                    <Button size="sm" loading={pending} onClick={() => request(m)}>
                      <Heart className="size-4" />
                      Être accompagné·e
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
