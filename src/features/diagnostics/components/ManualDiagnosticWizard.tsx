"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  Button,
  Checkbox,
  Chip,
  Field,
  Input,
  Stepper,
  Textarea,
  toast,
} from "@/shared/ui";
import { routes } from "@/shared/config/routes";
import { CATEGORIES, getCategory } from "../data/categories";
import { startManualDiagnostic } from "../api/actions";
import { savePendingDiagnostic } from "../lib/pending";
import {
  manualDiagnosticSchema,
  type ManualDiagnosticInput,
} from "../schemas/manual-diagnostic.schema";

const STEPS = ["Catégorie", "Ton idée", "Bilan"];

export function ManualDiagnosticWizard({
  isAuthed = false,
  onAnonSubmit,
}: {
  isAuthed?: boolean;
  /** Anonyme : on stashe le payload et on affiche le teaser verrouillé (pas de bilan révélé). */
  onAnonSubmit?: (projectName: string) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ManualDiagnosticInput>({
    resolver: zodResolver(manualDiagnosticSchema),
    defaultValues: { projectName: "", sector: "", description: "" },
  });

  const sector = useWatch({ control, name: "sector" });
  const category = getCategory(sector);

  async function next() {
    const fields: (keyof ManualDiagnosticInput)[][] = [
      ["projectName", "sector"],
      ["description"],
    ];
    const ok = await trigger(fields[step]);
    if (ok) setStep((s) => s + 1);
  }

  function onValid(data: ManualDiagnosticInput) {
    const raw = data.fundingNeed?.trim();
    const fundingNeed = raw ? Number(raw) : undefined;
    const payload = {
      projectName: data.projectName,
      sector: data.sector,
      description: data.description,
      fundingNeed: fundingNeed && !Number.isNaN(fundingNeed) ? fundingNeed : undefined,
      consent: data.consent,
      answers,
    };

    // Anonyme : pas d'appel authentifié (il 401-erait), et on NE révèle PAS le bilan. On stashe
    // le payload pour le rejouer après inscription → teaser verrouillé. Le vrai bilan (LLM) naîtra
    // dans son espace.
    if (!isAuthed) {
      savePendingDiagnostic(payload);
      onAnonSubmit?.(data.projectName);
      return;
    }

    startTransition(async () => {
      const res = await startManualDiagnostic(payload);
      if (res.ok) router.push(routes.bilan(res.reportId));
      else toast.error(res.message);
    });
  }

  return (
    <div className="space-y-8">
      <Stepper steps={STEPS} current={step} />

      {step === 0 ? (
        <div className="space-y-5">
          <Field label="Nom de ton projet" error={errors.projectName?.message}>
            <Input placeholder="Ex. AgriConnect" {...register("projectName")} />
          </Field>
          <Field
            label="Catégorie"
            description="Pour des questions adaptées à ta réalité."
            error={errors.sector?.message}
          >
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Chip
                  key={c.key}
                  selected={sector === c.key}
                  onClick={() =>
                    setValue("sector", c.key, { shouldValidate: true })
                  }
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </Field>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-5">
          <Field
            label="Décris ton idée"
            description="Pas de mauvaise réponse. On part d'où tu es."
            error={errors.description?.message}
          >
            <Textarea
              rows={4}
              placeholder="Mon projet aide…"
              {...register("description")}
            />
          </Field>

          {category?.questions.map((q) => (
            <Field key={q.id} label={q.label}>
              <Textarea
                rows={2}
                placeholder={q.placeholder}
                value={answers[q.id] ?? ""}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                }
              />
            </Field>
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <Field
            label="Besoin de financement estimé (optionnel)"
            description="En euros. Tu pourras l'affiner plus tard."
            error={errors.fundingNeed?.message}
          >
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Ex. 50000"
              {...register("fundingNeed")}
            />
          </Field>
          <Controller
            control={control}
            name="consent"
            render={({ field }) => (
              <div className="space-y-1">
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                  label="J'accepte que mon idée soit analysée (RGPD)."
                />
                {errors.consent?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {errors.consent.message}
                  </p>
                ) : null}
              </div>
            )}
          />
        </div>
      ) : null}

      <div className="flex justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="size-5" />
          Retour
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>
            Continuer
            <ArrowRight className="size-5" />
          </Button>
        ) : (
          <Button onClick={handleSubmit(onValid)} loading={pending}>
            Voir mon bilan
          </Button>
        )}
      </div>
    </div>
  );
}
