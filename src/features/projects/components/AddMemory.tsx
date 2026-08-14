"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { Button, Textarea, toast } from "@/shared/ui";

import { addProjectMemory } from "../actions";

/**
 * Apporter une précision sur une dimension. Volontairement minuscule : c'est une réponse
 * à « il me manque ça », pas un formulaire. Ce que le porteur écrit ici entre dans la
 * mémoire projet et rend la dimension « déclarée » au lieu d'« inférée ».
 */
export function AddMemory({ projectId, dimension }: { projectId: string; dimension: string }) {
  const t = useTranslations("Bilan.memory");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [statement, setStatement] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    const value = statement.trim();
    if (value.length < 3) return;
    startTransition(async () => {
      const res = await addProjectMemory(projectId, { dimension, statement: value });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(t("added"));
      setStatement("");
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="-ml-2 text-xs" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" />
        {t("add")}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea
        rows={2}
        autoFocus
        className="min-h-16 py-2 text-sm"
        placeholder={t("placeholder")}
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
      />
      <div className="flex gap-2">
        <Button size="sm" loading={pending} onClick={submit} disabled={statement.trim().length < 3}>
          {t("save")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
