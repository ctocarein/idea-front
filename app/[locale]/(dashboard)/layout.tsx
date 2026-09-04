import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { routes } from "@/shared/config/routes";
import { features } from "@/shared/config/features";
import { getSession } from "@/shared/auth/server";
import { SessionProvider } from "@/shared/auth";
import { AppShell, type NavItem } from "@/shared/layout";
import { signOut } from "@/features/auth";

/** Espace privé (auth-gated) → jamais indexé. */
export const metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect(routes.login);

  // Nav resserrée, calée sur le seul moment validé (v3.1 §5). Studio, éditeur de pitch,
  // Simulateur & Mentors sont derrière un flag : ils ne sont plus des destinations.
  const t = await getTranslations("Nav");
  const nav: NavItem[] = [
    { href: routes.dashboard, label: t("dashboard"), shortLabel: t("dashboardShort"), icon: "overview" },
    { href: routes.academy, label: t("workshop"), icon: "academy" },
    ...(features.studio
      ? [{ href: routes.studio, label: t("studio"), icon: "studio" } as NavItem]
      : []),
    ...(features.pitchSimulator
      ? [{ href: routes.pitchSim, label: t("simulator"), shortLabel: t("simulatorShort"), icon: "pitch" } as NavItem]
      : []),
    { href: routes.opportunities, label: t("opportunities"), shortLabel: t("opportunitiesShort"), icon: "opportunities" },
    ...(features.mentors ? [{ href: routes.mentors, label: t("mentors"), icon: "mentors" } as NavItem] : []),
    { href: routes.profile, label: t("profile"), shortLabel: t("profileShort"), icon: "profile" },
  ];
  // Profilage progressif (CRO) : l'onboarding n'est plus un MUR. Un porteur qui vient
  // de faire un diagnostic anonyme doit atteindre son bilan sans détour. L'onboarding
  // reste proposé (redirection post-inscription + bandeau doux sur le dashboard), mais
  // il est skippable — on ne bloque jamais l'accès à l'espace.

  return (
    <SessionProvider session={session}>
      <AppShell
        spaceLabel={t("space")}
        nav={nav}
        user={{ name: session.name, roleLabel: t("role") }}
        signOutAction={signOut}
      >
        {children}
      </AppShell>
    </SessionProvider>
  );
}
