"use client";

import { useState } from "react";

import { Button, Card, CardContent, EmptyState, toast } from "@/shared/ui";
import { Inbox } from "lucide-react";

type Request = { id: string; founder: string; project: string; sector: string };

const SEED: Request[] = [
  { id: "q1", founder: "Awa Diallo", project: "AgriConnect", sector: "Agritech" },
  { id: "q2", founder: "Koffi Mensah", project: "PayNow", sector: "Fintech" },
];

/** Demandes de mise en relation reçues (côté mentor). Accept/refus mockés. */
export function MentorRequests() {
  const [requests, setRequests] = useState<Request[]>(SEED);

  function resolve(id: string, accepted: boolean) {
    setRequests((r) => r.filter((x) => x.id !== id));
    toast.success(accepted ? "Demande acceptée" : "Demande refusée");
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucune demande en attente"
        description="Les porteurs qui te sollicitent apparaîtront ici."
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <div>
              <p className="font-medium">{r.project}</p>
              <p className="text-sm text-muted-foreground">
                {r.founder} · {r.sector}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => resolve(r.id, false)}
              >
                Refuser
              </Button>
              <Button size="sm" onClick={() => resolve(r.id, true)}>
                Accepter
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
