"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Checkbox, Field, Input, toast } from "@/shared/ui";
import { registerSchema, type RegisterInput } from "../schemas/auth.schema";
import { registerFounder } from "../api/actions";

/** Création de compte porteur. Ton encourageant (charte §1.6). */
export function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      const res = await registerFounder(data.name, data.email, data.password);
      if (res.ok) router.push(res.redirectTo);
      else toast.error(res.message);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Ton nom" error={errors.name?.message}>
        <Input autoComplete="name" placeholder="Ex. Awa" {...register("name")} />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="toi@exemple.com"
          {...register("email")}
        />
      </Field>
      <Field
        label="Mot de passe"
        description="8 caractères minimum."
        error={errors.password?.message}
      >
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register("password")}
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
              label="J'accepte la politique de confidentialité (RGPD)."
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
        Créer mon espace
      </Button>
    </form>
  );
}
