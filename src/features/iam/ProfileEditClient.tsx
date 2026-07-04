"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Save, CheckCircle2 } from "lucide-react";

import { Field, Input, Select, SelectItem, Button, Card, CardContent, toast } from "@/shared/ui";

import { updateProfile, type ProfileFormData } from "./profileActions";

// Codes pays (les noms sont résolus via Intl.DisplayNames selon la langue active).
const COUNTRY_CODES = [
  "CI", "SN", "CM", "GN", "ML", "BF", "TG", "BJ", "CD", "CG", "GA", "MG",
  "MA", "TN", "DZ", "NG", "GH", "FR", "BE", "CH", "CA", "US",
];
const PRO_STATUS_VALUES = ["student", "employee", "entrepreneur", "freelance", "career_change", "unemployed"];
const PROJECT_STAGE_VALUES = ["idea", "validation", "mvp", "traction", "scale"];
const AVAILABILITY_VALUES = ["lt5", "h5_10", "h10_20", "gt20"];

export interface UserProfile {
  full_name: string;
  email: string;
  country: string | null;
  city: string | null;
  professional_status: string | null;
  project_stage: string | null;
  weekly_availability: string | null;
}

interface Props {
  profile: UserProfile;
}

export function ProfileEditClient({ profile }: Props) {
  const t = useTranslations("Profile");
  const tOnb = useTranslations("Auth.onboarding");
  const locale = useLocale();
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: "region" });
    return COUNTRY_CODES.map((code) => ({ code, label: names.of(code) ?? code }))
      .sort((a, b) => a.label.localeCompare(b.label, locale));
  }, [locale]);
  const [form, setForm] = useState<ProfileFormData>({
    country:              profile.country              ?? "",
    city:                 profile.city                 ?? "",
    professional_status:  profile.professional_status  ?? "",
    project_stage:        profile.project_stage        ?? "",
    weekly_availability:  profile.weekly_availability  ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof ProfileFormData>(key: K, value: string) {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProfile(form);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setSaved(true);
      toast.success(t("toastSaved"));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Infos fixes */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("identity")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("fullName")}>
              <Input value={profile.full_name} disabled />
            </Field>
            <Field label={t("email")}>
              <Input value={profile.email} disabled type="email" />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Profil éditable */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("founderProfile")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("country")}>
              <Select
                value={form.country}
                onValueChange={(v) => set("country", v)}
                placeholder={t("countryPlaceholder")}
              >
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </Select>
            </Field>

            <Field label={t("city")}>
              <Input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder={t("cityPlaceholder")}
              />
            </Field>
          </div>

          <Field label={t("proStatus")}>
            <Select
              value={form.professional_status}
              onValueChange={(v) => set("professional_status", v)}
              placeholder={t("proStatusPlaceholder")}
            >
              {PRO_STATUS_VALUES.map((v) => (
                <SelectItem key={v} value={v}>
                  {tOnb(`proStatuses.${v}`)}
                </SelectItem>
              ))}
            </Select>
          </Field>

          <Field label={t("stage")}>
            <Select
              value={form.project_stage}
              onValueChange={(v) => set("project_stage", v)}
              placeholder={t("stagePlaceholder")}
            >
              {PROJECT_STAGE_VALUES.map((v) => (
                <SelectItem key={v} value={v}>
                  {tOnb(`stages.${v}`)}
                </SelectItem>
              ))}
            </Select>
          </Field>

          <Field label={t("availability")}>
            <Select
              value={form.weekly_availability}
              onValueChange={(v) => set("weekly_availability", v)}
              placeholder={t("availabilityPlaceholder")}
            >
              {AVAILABILITY_VALUES.map((v) => (
                <SelectItem key={v} value={v}>
                  {tOnb(`availabilities.${v}`)}
                </SelectItem>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {saved ? (
            <>
              <CheckCircle2 className="mr-1.5 size-4 text-success" />
              {t("saved")}
            </>
          ) : isPending ? (
            t("saving")
          ) : (
            <>
              <Save className="mr-1.5 size-4" />
              {t("save")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
