"use client";

import { useState, useTransition } from "react";
import { Inbox, Calendar, CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent } from "@/shared/ui/Card";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { EmptyState, toast } from "@/shared/ui";

import type { MentorRequestDetail } from "../api";
import { acceptRequest, declineRequest, planSession, completeRequest } from "../actions";

type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "outline";

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  requested:       { label: "En attente",       variant: "warning" },
  accepted:        { label: "Acceptée",          variant: "primary" },
  session_planned: { label: "Session planifiée", variant: "success" },
  done:            { label: "Terminée",          variant: "neutral" },
  declined:        { label: "Refusée",           variant: "danger"  },
  cancelled:       { label: "Annulée",           variant: "outline" },
};

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  initialRequests: MentorRequestDetail[];
}

/** Demandes de mise en relation reçues (côté mentor) — vraies données. */
export function MentorRequests({ initialRequests }: Props) {
  const [requests, setRequests] = useState(initialRequests);
  const [planTarget, setPlanTarget] = useState<MentorRequestDetail | null>(null);
  const [sessionDateInput, setSessionDateInput] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateRequest(updated: MentorRequestDetail) {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  async function handleAccept(req: MentorRequestDetail) {
    setActionId(req.id + ":accept");
    const result = await acceptRequest(req.id);
    setActionId(null);
    if (!result.ok) { toast.error(result.message); return; }
    startTransition(() => updateRequest(result.data));
    toast.success("Demande acceptée !");
  }

  async function handleDecline(req: MentorRequestDetail) {
    setActionId(req.id + ":decline");
    const result = await declineRequest(req.id);
    setActionId(null);
    if (!result.ok) { toast.error(result.message); return; }
    startTransition(() => updateRequest(result.data));
    toast.success("Demande refusée.");
  }

  async function handlePlanSession() {
    if (!planTarget || !sessionDateInput) return;
    setActionId(planTarget.id + ":plan");
    const result = await planSession(planTarget.id, new Date(sessionDateInput).toISOString());
    setActionId(null);
    if (!result.ok) { toast.error(result.message); return; }
    startTransition(() => updateRequest(result.data));
    setPlanTarget(null);
    toast.success("Session planifiée !");
  }

  async function handleComplete(req: MentorRequestDetail) {
    setActionId(req.id + ":complete");
    const result = await completeRequest(req.id);
    setActionId(null);
    if (!result.ok) { toast.error(result.message); return; }
    startTransition(() => updateRequest(result.data));
    toast.success("Session marquée comme terminée.");
  }

  const pending   = requests.filter((r) => r.status === "requested");
  const active    = requests.filter((r) => ["accepted", "session_planned"].includes(r.status));
  const history   = requests.filter((r) => ["done", "declined", "cancelled"].includes(r.status));

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucune demande reçue"
        description="Les porteurs qui te sollicitent apparaîtront ici."
      />
    );
  }

  function RequestCard({ req }: { req: MentorRequestDetail }) {
    const cfg = STATUS_CONFIG[req.status] ?? { label: req.status, variant: "neutral" as BadgeVariant };
    const isActing = actionId?.startsWith(req.id);

    return (
      <Card>
        <CardContent className="space-y-3 pt-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{req.founder_name}</p>
              {req.message && (
                <p className="mt-0.5 text-sm text-muted-foreground italic">« {req.message} »</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {fmtDate(req.created_at)}
              </p>
            </div>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>

          {req.session_at && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-success">
              <Calendar className="size-4" />
              Session le {fmtDate(req.session_at)}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {req.status === "requested" && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!!isActing}
                  onClick={() => handleDecline(req)}
                >
                  {actionId === req.id + ":decline" ? "…" : "Refuser"}
                </Button>
                <Button
                  size="sm"
                  disabled={!!isActing}
                  onClick={() => handleAccept(req)}
                >
                  {actionId === req.id + ":accept" ? "…" : "Accepter"}
                </Button>
              </>
            )}
            {req.status === "accepted" && (
              <Button
                size="sm"
                variant="outline"
                disabled={!!isActing}
                onClick={() => { setPlanTarget(req); setSessionDateInput(""); }}
              >
                <Calendar className="mr-1.5 size-4" />
                Planifier une session
              </Button>
            )}
            {req.status === "session_planned" && (
              <Button
                size="sm"
                disabled={!!isActing}
                onClick={() => handleComplete(req)}
              >
                <CheckCircle2 className="mr-1.5 size-4" />
                {actionId === req.id + ":complete" ? "…" : "Marquer terminée"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {pending.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3.5" />
              En attente ({pending.length})
            </h3>
            {pending.map((r) => <RequestCard key={r.id} req={r} />)}
          </div>
        )}
        {active.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              En cours
            </h3>
            {active.map((r) => <RequestCard key={r.id} req={r} />)}
          </div>
        )}
        {history.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Historique
            </h3>
            {history.map((r) => <RequestCard key={r.id} req={r} />)}
          </div>
        )}
      </div>

      <Modal
        open={!!planTarget}
        onOpenChange={(open) => { if (!open) setPlanTarget(null); }}
        title="Planifier une session"
        description={`Session avec ${planTarget?.founder_name ?? ""}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPlanTarget(null)} disabled={isPending}>
              Annuler
            </Button>
            <Button
              onClick={handlePlanSession}
              disabled={!sessionDateInput || actionId?.endsWith(":plan")}
            >
              {actionId?.endsWith(":plan") ? "Planification…" : "Confirmer"}
            </Button>
          </>
        }
      >
        <Field label="Date et heure de la session">
          <Input
            type="datetime-local"
            value={sessionDateInput}
            onChange={(e) => setSessionDateInput(e.target.value)}
          />
        </Field>
      </Modal>
    </>
  );
}
