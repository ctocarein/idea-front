import { ShieldCheck } from "lucide-react";

import { Badge, Button } from "@/shared/ui";
import type { Mentor } from "../data/mock";

/**
 * Carte mentor (vue porteur). Au MVP, la réputation = badge « vérifié »
 * (cold-start : pas encore d'avis — BESOINS_MENTOR point 2).
 */
export function MentorProfileCard({
  mentor,
  onRequest,
}: {
  mentor: Mentor;
  onRequest?: (mentor: Mentor) => void;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-secondary font-display text-base font-bold">
          {mentor.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold">
            {mentor.name}
          </p>
          {mentor.verified ? (
            <Badge variant="verified">
              <ShieldCheck /> Vérifié
            </Badge>
          ) : null}
        </div>
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">
        {mentor.bio}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {mentor.sectors.map((s) => (
          <Badge key={s} variant="neutral">
            {s}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {mentor.feeEur ? `${mentor.feeEur} €/h` : "Tarif sur demande"}
        </span>
        {onRequest ? (
          <Button size="sm" onClick={() => onRequest(mentor)}>
            Demander
          </Button>
        ) : null}
      </div>
    </div>
  );
}
