"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Plus, Pencil, Archive, RotateCcw, AlertCircle } from "lucide-react";

import { Modal, Field, Input, Textarea, Select, SelectItem, Badge, Button, Card, CardContent } from "@/shared/ui";

import type { OpportunityAdminOut } from "./adminApi";
import {
  createOpportunity,
  updateOpportunity,
  setOpportunityActive,
  type OpportunityFormData,
} from "./adminActions";

const KIND_VALUES = ["concours", "hackathon", "incubateur", "mentorat", "financement"];

const EMPTY_FORM: OpportunityFormData = {
  title: "",
  kind: "concours",
  description: "",
  sector: "",
  min_overall: 0,
  min_maturity: null,
  deadline: null,
  is_active: true,
};

function toFormData(opp: OpportunityAdminOut): OpportunityFormData {
  return {
    title: opp.title,
    kind: opp.kind,
    description: opp.description,
    sector: opp.sector ?? "",
    min_overall: opp.min_overall,
    min_maturity: opp.min_maturity ?? null,
    deadline: opp.deadline ? opp.deadline.slice(0, 10) : null,
    is_active: opp.is_active,
  };
}

interface FormProps {
  initial: OpportunityFormData;
  onSave: (data: OpportunityFormData) => Promise<void>;
  onCancel: () => void;
  pending: boolean;
  error: string | null;
}

function OpportunityForm({ initial, onSave, onCancel, pending, error }: FormProps) {
  const t = useTranslations("Admin.opportunities");
  const [form, setForm] = useState<OpportunityFormData>(initial);

  function set<K extends keyof OpportunityFormData>(key: K, value: OpportunityFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <Field label={t("form.title")} required>
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
          placeholder={t("form.titlePlaceholder")}
        />
      </Field>

      <Field label={t("form.type")}>
        <Select value={form.kind} onValueChange={(v) => set("kind", v)}>
          {KIND_VALUES.map((value) => (
            <SelectItem key={value} value={value}>
              {t(`kinds.${value}`)}
            </SelectItem>
          ))}
        </Select>
      </Field>

      <Field label={t("form.description")}>
        <Textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder={t("form.descriptionPlaceholder")}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("form.sector")}>
          <Input
            value={form.sector}
            onChange={(e) => set("sector", e.target.value)}
            placeholder={t("form.sectorPlaceholder")}
          />
        </Field>
        <Field label={t("form.deadline")}>
          <Input
            type="date"
            value={form.deadline ?? ""}
            onChange={(e) => set("deadline", e.target.value || null)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("form.minOverall")}>
          <Input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={form.min_overall}
            onChange={(e) => set("min_overall", parseFloat(e.target.value) || 0)}
          />
        </Field>
        <Field label={t("form.minMaturity")}>
          <Input
            type="number"
            min={0}
            max={10}
            step={1}
            value={form.min_maturity ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              set("min_maturity", v === "" ? null : parseInt(v, 10));
            }}
            placeholder="–"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => set("is_active", e.target.checked)}
          className="rounded border-border accent-primary"
        />
        {t("form.active")}
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          {t("form.cancel")}
        </Button>
        <Button type="submit" disabled={pending || !form.title}>
          {pending ? t("form.saving") : t("form.save")}
        </Button>
      </div>
    </form>
  );
}

interface OppTableProps {
  rows: OpportunityAdminOut[];
  label: string;
  togglingId: string | null;
  onEdit: (opp: OpportunityAdminOut) => void;
  onToggle: (opp: OpportunityAdminOut) => void;
}

function OppTable({ rows, label, togglingId, onEdit, onToggle }: OppTableProps) {
  const t = useTranslations("Admin.opportunities");
  const locale = useLocale();
  const formatDeadline = (d: string | null): string =>
    d ? new Date(d).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" }) : "–";
  if (rows.length === 0) return null;
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h2>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">{t("cols.title")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("cols.type")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("cols.minScore")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("cols.sector")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("cols.deadline")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("cols.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((opp) => (
              <tr key={opp.id} className="transition-colors hover:bg-secondary/20">
                <td className="px-4 py-3 font-medium">{opp.title}</td>
                <td className="px-4 py-3">
                  <Badge variant="neutral">{t.has(`kinds.${opp.kind}`) ? t(`kinds.${opp.kind}`) : opp.kind}</Badge>
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {opp.min_overall > 0 ? t("minScoreVal", { score: opp.min_overall }) : "–"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{opp.sector ?? t("allSectorsShort")}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDeadline(opp.deadline)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(opp)}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      title={t("edit")}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => onToggle(opp)}
                      disabled={togglingId === opp.id}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                      title={opp.is_active ? t("archive") : t("restore")}
                    >
                      {opp.is_active ? (
                        <Archive className="size-3.5" />
                      ) : (
                        <RotateCcw className="size-3.5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface Props {
  initialOpportunities: OpportunityAdminOut[];
}

export function OpportunitiesAdminClient({ initialOpportunities }: Props) {
  const t = useTranslations("Admin.opportunities");
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OpportunityAdminOut | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function openCreate() {
    setEditTarget(null);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(opp: OpportunityAdminOut) {
    setEditTarget(opp);
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave(data: OpportunityFormData) {
    setFormError(null);
    startTransition(async () => {
      const result = editTarget
        ? await updateOpportunity(editTarget.id, data)
        : await createOpportunity(data);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      const updated = result.data;
      setOpportunities((prev) => {
        if (editTarget) {
          return prev.map((o) => (o.id === updated.id ? updated : o));
        }
        return [updated, ...prev];
      });
      setModalOpen(false);
    });
  }

  async function handleToggleActive(opp: OpportunityAdminOut) {
    setTogglingId(opp.id);
    const result = await setOpportunityActive(opp.id, !opp.is_active);
    setTogglingId(null);
    if (result.ok) {
      setOpportunities((prev) => prev.map((o) => (o.id === result.data.id ? result.data : o)));
    }
  }

  const active = opportunities.filter((o) => o.is_active);
  const archived = opportunities.filter((o) => !o.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("activeCount", { count: active.length })}
          {archived.length > 0 && t("archivedCount", { count: archived.length })}
        </p>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1.5 size-4" />
          {t("new")}
        </Button>
      </div>

      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("emptyCatalogue")}
          </CardContent>
        </Card>
      ) : (
        <>
          <OppTable
            rows={active}
            label={t("sectionActive")}
            togglingId={togglingId}
            onEdit={openEdit}
            onToggle={handleToggleActive}
          />
          <OppTable
            rows={archived}
            label={t("sectionArchived")}
            togglingId={togglingId}
            onEdit={openEdit}
            onToggle={handleToggleActive}
          />
        </>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) setModalOpen(false);
        }}
        title={editTarget ? t("modalEditTitle") : t("modalNewTitle")}
        description={editTarget ? t("modalEditDesc") : t("modalNewDesc")}
        className="max-w-xl"
      >
        <OpportunityForm
          key={editTarget?.id ?? "create"}
          initial={editTarget ? toFormData(editTarget) : EMPTY_FORM}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
          pending={isPending}
          error={formError}
        />
      </Modal>
    </div>
  );
}
