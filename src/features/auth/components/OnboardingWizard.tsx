"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button, Field, Input, Select, SelectItem, Stepper } from "@/shared/ui";
import { routes } from "@/shared/config/routes";
import { completeOnboarding } from "../api/actions";

const STEP_COUNT = 3;

const COUNTRIES = [
  { code: "CI", label: "Côte d'Ivoire" },
  { code: "SN", label: "Sénégal" },
  { code: "CM", label: "Cameroun" },
  { code: "GN", label: "Guinée" },
  { code: "ML", label: "Mali" },
  { code: "BF", label: "Burkina Faso" },
  { code: "TG", label: "Togo" },
  { code: "BJ", label: "Bénin" },
  { code: "CD", label: "RD Congo" },
  { code: "CG", label: "Congo-Brazzaville" },
  { code: "GA", label: "Gabon" },
  { code: "MG", label: "Madagascar" },
  { code: "MA", label: "Maroc" },
  { code: "TN", label: "Tunisie" },
  { code: "DZ", label: "Algérie" },
  { code: "NG", label: "Nigeria" },
  { code: "GH", label: "Ghana" },
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "CA", label: "Canada" },
  { code: "US", label: "États-Unis" },
];

const PRO_STATUS = [
  { value: "student", label: "Étudiant(e)" },
  { value: "employee", label: "Salarié(e)" },
  { value: "entrepreneur", label: "Entrepreneur(e)" },
  { value: "freelance", label: "Freelance / Indépendant(e)" },
  { value: "career_change", label: "En reconversion" },
  { value: "unemployed", label: "Sans emploi" },
];

const PROJECT_STAGES = [
  { value: "idea", label: "Idée — je cherche à valider" },
  { value: "validation", label: "En validation — j'ai des premiers retours" },
  { value: "mvp", label: "MVP — j'ai un produit" },
  { value: "traction", label: "Traction — j'ai des clients" },
  { value: "scale", label: "Scale — je cherche à croître" },
];

const AVAILABILITY = [
  { value: "lt5", label: "Moins de 5h / semaine" },
  { value: "h5_10", label: "5 à 10h / semaine" },
  { value: "h10_20", label: "10 à 20h / semaine" },
  { value: "gt20", label: "Plus de 20h / semaine" },
];

export function OnboardingWizard({ name: initialName = "" }: { name?: string }) {
  const t = useTranslations("Auth.onboarding");
  const locale = useLocale();
  const regionNames = new Intl.DisplayNames([locale], { type: "region" });
  const steps = [t("steps.welcome"), t("steps.profile"), t("steps.ready")];
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [proStatus, setProStatus] = useState("");
  const [projectStage, setProjectStage] = useState("");
  const [availability, setAvailability] = useState("");

  const profileComplete = country && proStatus && projectStage;

  function finish() {
    setError(null);
    startTransition(async () => {
      const res = await completeOnboarding({
        country,
        city: city.trim() || undefined,
        professional_status: proStatus,
        project_stage: projectStage,
        weekly_availability: availability || undefined,
      });
      if (res.ok) {
        router.push(res.redirectTo);
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <div className="space-y-8">
      <Stepper steps={steps} current={step} />

      {step === 0 ? (
        <div className="space-y-4 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-dawn text-ink">
            <Sparkles className="size-7" />
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {t("step0Title")}
          </h1>
          <p className="mx-auto max-w-sm text-muted-foreground">{t("step0Text")}</p>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("country")}>
              <Select
                value={country}
                onValueChange={setCountry}
                placeholder={t("countryPlaceholder")}
              >
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {regionNames.of(c.code) ?? c.label}
                  </SelectItem>
                ))}
              </Select>
            </Field>
            <Field label={t("city")}>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("cityPlaceholder")}
              />
            </Field>
          </div>

          <Field label={t("proStatus")}>
            <Select
              value={proStatus}
              onValueChange={setProStatus}
              placeholder={t("proStatusPlaceholder")}
            >
              {PRO_STATUS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {t(`proStatuses.${s.value}`)}
                </SelectItem>
              ))}
            </Select>
          </Field>

          <Field label={t("stage")}>
            <Select
              value={projectStage}
              onValueChange={setProjectStage}
              placeholder={t("stagePlaceholder")}
            >
              {PROJECT_STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {t(`stages.${s.value}`)}
                </SelectItem>
              ))}
            </Select>
          </Field>

          <Field label={t("availability")}>
            <Select
              value={availability}
              onValueChange={setAvailability}
              placeholder={t("availabilityPlaceholder")}
            >
              {AVAILABILITY.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {t(`availabilities.${a.value}`)}
                </SelectItem>
              ))}
            </Select>
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3 text-center">
          <h2 className="font-display text-xl font-bold">
            {t("welcomeName", { name: initialName || "porteur" })}
          </h2>
          <p className="mx-auto max-w-sm text-muted-foreground">{t("readyText")}</p>
          {error ? (
            <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || pending}
        >
          {t("back")}
        </Button>

        {step < STEP_COUNT - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !profileComplete}
          >
            {t("continue")}
            <ArrowRight className="size-5" />
          </Button>
        ) : (
          <Button onClick={finish} loading={pending}>
            {t("finish")}
            <ArrowRight className="size-5" />
          </Button>
        )}
      </div>

      {/* Profilage progressif : jamais un mur. On complètera depuis le profil. */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => router.push(routes.dashboard)}
          disabled={pending}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
        >
          {t("skip")}
        </button>
      </div>
    </div>
  );
}
