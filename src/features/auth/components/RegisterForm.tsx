"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";

import { Button, Checkbox, Field, Input, toast } from "@/shared/ui";
import { routes } from "@/shared/config/routes";
import { loadPendingDiagnostic } from "@/features/diagnostics";
import { registerSchema, type RegisterInput } from "../schemas/auth.schema";
import { registerFounder } from "../api/actions";

/** Création de compte porteur. Ton encourageant (charte §1.6). */
export function RegisterForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const password = watch("password") ?? "";

  function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      const res = await registerFounder(data.name, data.email, data.password, locale);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      // Un diagnostic anonyme attend d'être rattaché → on file droit à la relecture : le wizard
      // organise le récit (l'IA) à son ouverture, le porteur relit puis lance son bilan. Le
      // dashboard n'est plus une étape intermédiaire, c'est la destination finale. Sinon, onboarding.
      router.push(loadPendingDiagnostic() ? routes.ajuster : res.redirectTo);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label={t("register.name")} error={errors.name?.message}>
        <Input autoComplete="name" placeholder={t("register.namePlaceholder")} {...register("name")} />
      </Field>
      <Field label={t("email")} error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          {...register("email")}
        />
      </Field>
      <Field
        label={t("password")}
        description={t("register.passwordHint")}
        error={errors.password?.message}
      >
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register("password")}
        />
        <PasswordStrength password={password} />
      </Field>
      <Controller
        control={control}
        name="consent"
        render={({ field }) => (
          <div className="space-y-1">
            <Checkbox
              checked={!!field.value}
              onCheckedChange={(v) => field.onChange(v === true)}
              label={t("register.consent")}
            />
            {errors.consent?.message ? (
              <p className="text-xs font-medium text-destructive">
                {errors.consent.message}
              </p>
            ) : null}
          </div>
        )}
      />
      <Button type="submit" className="w-full" loading={pending}>
        {t("register.submit")}
      </Button>
    </form>
  );
}

/** Force du mot de passe (heuristique locale, sans lib). Indicatif — la règle
 *  serveur reste « 8 caractères minimum ». */
function passwordScore(pw: string): number {
  if (!pw) return 0;
  if (pw.length < 8) return 1; // sous le minimum serveur → toujours Faible
  let s = 1;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

const STRENGTH_COLOR = ["", "bg-destructive", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];
const STRENGTH_KEY = ["", "weak", "medium", "good", "strong"] as const;

function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations("Auth.register");
  if (!password) return null;
  const score = passwordScore(password);
  const color = STRENGTH_COLOR[score];
  const key = STRENGTH_KEY[score];
  return (
    <div className="mt-2 space-y-1" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i <= score ? color : "bg-border"}`} />
        ))}
      </div>
      {key && (
        <p className="text-xs text-muted-foreground">
          {t("strengthLabel", { level: t(`strength.${key}`) })}
        </p>
      )}
    </div>
  );
}
