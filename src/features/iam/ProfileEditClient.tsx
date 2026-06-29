"use client";

import { useState, useTransition } from "react";
import { Save, CheckCircle2 } from "lucide-react";

import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Select, SelectItem } from "@/shared/ui/Select";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent } from "@/shared/ui/Card";
import { toast } from "@/shared/ui";

import { updateProfile, type ProfileFormData } from "./profileActions";

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

const PROFESSIONAL_STATUS = [
  { value: "student",       label: "Étudiant(e)" },
  { value: "employee",      label: "Salarié(e)" },
  { value: "entrepreneur",  label: "Entrepreneur(e)" },
  { value: "freelance",     label: "Freelance / Indépendant(e)" },
  { value: "career_change", label: "En reconversion" },
  { value: "unemployed",    label: "Sans emploi" },
];

const PROJECT_STAGE = [
  { value: "idea",       label: "Idée — je cherche à valider" },
  { value: "validation", label: "En validation — j'ai des premiers retours" },
  { value: "mvp",        label: "MVP — j'ai un produit" },
  { value: "traction",   label: "Traction — j'ai des clients" },
  { value: "scale",      label: "Scale — je cherche à croître" },
];

const AVAILABILITY = [
  { value: "lt5",   label: "Moins de 5h / semaine" },
  { value: "h5_10", label: "5 à 10h / semaine" },
  { value: "h10_20",label: "10 à 20h / semaine" },
  { value: "gt20",  label: "Plus de 20h / semaine" },
];

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
      toast.success("Profil mis à jour !");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Infos fixes */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Identité
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom complet">
              <Input value={profile.full_name} disabled />
            </Field>
            <Field label="Adresse email">
              <Input value={profile.email} disabled type="email" />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Profil éditable */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Profil porteur
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pays">
              <Select
                value={form.country}
                onValueChange={(v) => set("country", v)}
                placeholder="Sélectionne ton pays"
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
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Ex : Abidjan"
              />
            </Field>
          </div>

          <Field label="Statut professionnel">
            <Select
              value={form.professional_status}
              onValueChange={(v) => set("professional_status", v)}
              placeholder="Sélectionne ton statut"
            >
              {PROFESSIONAL_STATUS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </Select>
          </Field>

          <Field label="Stade du projet">
            <Select
              value={form.project_stage}
              onValueChange={(v) => set("project_stage", v)}
              placeholder="Où en es-tu ?"
            >
              {PROJECT_STAGE.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </Select>
          </Field>

          <Field label="Disponibilité hebdomadaire">
            <Select
              value={form.weekly_availability}
              onValueChange={(v) => set("weekly_availability", v)}
              placeholder="Combien de temps par semaine ?"
            >
              {AVAILABILITY.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
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
              Sauvegardé
            </>
          ) : isPending ? (
            "Enregistrement…"
          ) : (
            <>
              <Save className="mr-1.5 size-4" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
