"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button, Field, Input, Stepper } from "@/shared/ui";
import { routes } from "@/shared/config/routes";

const STEPS = ["Bienvenue", "Ton profil", "C'est parti"];

/**
 * Accueil porteur POST-inscription (CHARTE §1.1 : « de la nuit vers la lumière »).
 * Le compte est déjà créé (RegisterForm) ; ce wizard est un accueil encourageant qui
 * mène à l'espace porteur et à la première étape (le diagnostic).
 */
export function OnboardingWizard({ name: initialName = "" }: { name?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();

  const canContinue = step === 0 || (name.trim().length >= 2 && email.includes("@"));

  function finish() {
    startTransition(() => {
      router.push(routes.dashboard);
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
            Pas de mauvaise réponse. On va d&apos;abord t&apos;aider à comprendre
            ton projet, puis à le rendre solide. Gratuitement.
          </p>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <Field label="Comment on t'appelle ?">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Awa"
              autoFocus
            />
          </Field>
          <Field label="Ton email" description="Pour retrouver ton espace.">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
            />
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-2 text-center">
          <h2 className="font-display text-xl font-bold">
            Bienvenue, {name || "porteur"} 👋
          </h2>
          <p className="mx-auto max-w-sm text-muted-foreground">
            Ton espace est prêt. La première étape : un diagnostic pour
            comprendre ton projet.
          </p>
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
            disabled={!canContinue}
          >
            Continuer
            <ArrowRight className="size-5" />
          </Button>
        ) : (
          <Button onClick={finish} loading={pending}>
            Créer mon espace
          </Button>
        )}
      </div>
    </div>
  );
}
