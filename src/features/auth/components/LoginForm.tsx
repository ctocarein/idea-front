"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { Button, Field, Input, toast } from "@/shared/ui";
import { loginSchema, type LoginInput } from "../schemas/auth.schema";
import { login } from "../api/actions";

/** Formulaire de connexion (validation client miroir des DTO backend). */
export function LoginForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onSubmit(data: LoginInput) {
    startTransition(async () => {
      const res = await login(data.email, data.password);
      if (res.ok) router.push(res.redirectTo);
      else toast.error(res.message);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label={t("email")} error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          {...register("email")}
        />
      </Field>
      <Field label={t("password")} error={errors.password?.message}>
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register("password")}
        />
      </Field>
      <Button type="submit" className="w-full" loading={pending}>
        {t("login.submit")}
      </Button>
    </form>
  );
}
