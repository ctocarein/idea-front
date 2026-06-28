"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button, Field, Input, Select, SelectItem, Stepper } from "@/shared/ui";
import { completeOnboarding } from "../api/actions";

const STEPS = ["Bienvenue", "Ton profil", "C'est parti"];

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
      <Stepper steps={STEPS} current={step} />

      {step === 0 ? (
        <div className="space-y-4 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-dawn text-ink">
            <Sparkles className="size-7" />
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            On part d&apos;où tu es.
          </h1>
          <p className="mx-auto max-w-sm text-muted-foreground">
            Quelques infos rapides pour personnaliser ton parcours — mentors,
            modules Academy et opportunités adaptés à ton profil.
          </p>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pays *">
              <Select
                value={country}
                onValueChange={setCountry}
                placeholder="Ton pays"
              >
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </Select>
            </Field>
            <Field label="Ville (optionnel)">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex. Abidjan"
              />
            </Field>
          </div>

          <Field label="Statut professionnel *">
            <Select
              value={proStatus}
              onValueChange={setProStatus}
              placeholder="Ton situation actuelle"
            >
              {PRO_STATUS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </Select>
          </Field>

          <Field label="Où en est ton projet ? *">
            <Select
              value={projectStage}
              onValueChange={setProjectStage}
              placeholder="Le stade actuel"
            >
              {PROJECT_STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </Select>
          </Field>

          <Field label="Temps disponible / semaine (optionnel)">
            <Select
              value={availability}
              onValueChange={setAvailability}
              placeholder="Ta disponibilité"
            >
              {AVAILABILITY.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </Select>
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3 text-center">
          <h2 className="font-display text-xl font-bold">
            Bienvenue, {initialName || "porteur"} !
          </h2>
          <p className="mx-auto max-w-sm text-muted-foreground">
            Ton espace est prêt. Retrouve ton diagnostic, les modules Academy
            et les mentors adaptés à ton profil.
          </p>
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
          Retour
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !profileComplete}
          >
            Continuer
            <ArrowRight className="size-5" />
          </Button>
        ) : (
          <Button onClick={finish} loading={pending}>
            Accéder à mon espace
            <ArrowRight className="size-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
