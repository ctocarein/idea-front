import type { Metadata } from "next";

import { Card, CardContent } from "@/shared/ui";
import { OnboardingWizard } from "@/features/auth";

export const metadata: Metadata = { title: "Bienvenue" };

export default function OnboardingPage() {
  return (
    <Card>
      <CardContent className="pt-6">
        <OnboardingWizard />
      </CardContent>
    </Card>
  );
}
