"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Inbox, Calendar, CheckCircle2, Clock } from "lucide-react";

import { Badge, Button, Card, CardContent, Field, Input, Modal, EmptyState, toast } from "@/shared/ui";

import type { MentorRequestDetail } from "../api";
import { acceptRequest, declineRequest, planSession, completeRequest } from "../actions";

type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "outline";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  requested: "warning",
  accepted: "primary",
  session_planned: "success",
  done: "neutral",
  declined: "danger",
  cancelled: "outline",
};

interface Props {
  initialRequests: MentorRequestDetail[];
}

/** Demandes de mise en relation reçues (côté mentor) — vraies données. */
export function MentorRequests({ initialRequests }: Props) {
  const t = useTranslations("Mentor.incoming");
  const tStatus = useTranslations("Mentor.status");
  const locale = useLocale();
  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(locale, {
          day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
        })
      : null;
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
    toast.success(t("toastAccepted"));
  }

  async function handleDecline(req: MentorRequestDetail) {
    setActionId(req.id + ":decline");
    const result = await declineRequest(req.id);
    setActionId(null);
    if (!result.ok) { toast.error(result.message); return; }
    startTransition(() => updateRequest(result.data));
    toast.success(t("toastDeclined"));
  }

  async function handlePlanSession() {
    if (!planTarget || !sessionDateInput) return;
    setActionId(planTarget.id + ":plan");
    const result = await planSession(planTarget.id, new Date(sessionDateInput).toISOString());
    setActionId(null);
    if (!result.ok) { toast.error(result.message); return; }
    startTransition(() => updateRequest(result.data));
    setPlanTarget(null);
    toast.success(t("toastPlanned"));
  }

  async function handleComplete(req: MentorRequestDetail) {
    setActionId(req.id + ":complete");
    const result = await completeRequest(req.id);
    setActionId(null);
    if (!result.ok) { toast.error(result.message); return; }
    startTransition(() => updateRequest(result.data));
    toast.success(t("toastCompleted"));
  }

  const pending   = requests.filter((r) => r.status === "requested");
  const active    = requests.filter((r) => ["accepted", "session_planned"].includes(r.status));
  const history   = requests.filter((r) => ["done", "declined", "cancelled"].includes(r.status));

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={t("empty")}
        description={t("emptyDesc")}
      />
    );
  }

  function RequestCard({ req }: { req: MentorRequestDetail }) {
    const variant = STATUS_VARIANT[req.status] ?? "neutral";
    const statusLabel = tStatus.has(req.status) ? tStatus(req.status) : req.status;
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
            <Badge variant={variant}>{statusLabel}</Badge>
          </div>

          {req.session_at && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-success">
              <Calendar className="size-4" />
              {t("sessionOn", { date: fmtDate(req.session_at) ?? "" })}
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
                  {actionId === req.id + ":decline" ? "…" : t("decline")}
                </Button>
                <Button
                  size="sm"
                  disabled={!!isActing}
                  onClick={() => handleAccept(req)}
                >
                  {actionId === req.id + ":accept" ? "…" : t("accept")}
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
                {t("planSession")}
              </Button>
            )}
            {req.status === "session_planned" && (
              <Button
                size="sm"
                disabled={!!isActing}
                onClick={() => handleComplete(req)}
              >
                <CheckCircle2 className="mr-1.5 size-4" />
                {actionId === req.id + ":complete" ? "…" : t("markDone")}
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
              {t("pendingCount", { count: pending.length })}
            </h3>
            {pending.map((r) => <RequestCard key={r.id} req={r} />)}
          </div>
        )}
        {active.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("active")}
            </h3>
            {active.map((r) => <RequestCard key={r.id} req={r} />)}
          </div>
        )}
        {history.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("history")}
            </h3>
            {history.map((r) => <RequestCard key={r.id} req={r} />)}
          </div>
        )}
      </div>

      <Modal
        open={!!planTarget}
        onOpenChange={(open) => { if (!open) setPlanTarget(null); }}
        title={t("planModalTitle")}
        description={t("planModalDesc", { name: planTarget?.founder_name ?? "" })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPlanTarget(null)} disabled={isPending}>
              {t("planModalCancel")}
            </Button>
            <Button
              onClick={handlePlanSession}
              disabled={!sessionDateInput || actionId?.endsWith(":plan")}
            >
              {actionId?.endsWith(":plan") ? t("planning") : t("planModalConfirm")}
            </Button>
          </>
        }
      >
        <Field label={t("dateLabel")}>
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
