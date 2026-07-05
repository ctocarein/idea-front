"use client";

import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";

import { Badge, Button, Card, CardContent, toast } from "@/shared/ui";

const SECTORS = ["Fintech", "Stratégie"];
const SLOTS = ["Lun 10:00", "Mer 14:00", "Ven 09:00"];

/**
 * Profil mentor (vue mentor). Édition mockée. Au MVP, les honoraires sont un
 * champ non facturé (la facturation est v2 — BESOINS_MENTOR cas 1).
 */
export function MentorProfile() {
  const t = useTranslations("Mentor.profile");
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">{t("myProfile")}</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success(t("toastSaved"))}
            >
              {t("save")}
            </Button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("sectors")}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {SECTORS.map((s) => (
                <Badge key={s} variant="primary">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("bio")}</p>
            <p className="mt-1 text-sm">
              {t("bioDemo")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("fees")}
            </p>
            <p className="mt-1 text-sm font-medium">80 €/h</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <CalendarDays className="size-4" />
            {t("availability")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {SLOTS.map((s) => (
              <Badge key={s} variant="neutral">
                {s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
