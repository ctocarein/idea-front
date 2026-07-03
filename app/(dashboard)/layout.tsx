import { redirect } from "next/navigation";

import { routes } from "@/shared/config/routes";
import { features } from "@/shared/config/features";
import { getSession } from "@/shared/auth/server";
import { SessionProvider } from "@/shared/auth";
import { AppShell, type NavItem } from "@/shared/layout";
import { signOut } from "@/features/auth";

// Nav resserrée (2026-07-02) : 5 destinations calées sur le parcours. « Mes besoins » vit
// désormais en onglet du Workshop, « Partages » en onglet du Profil, et « Readiness » est
// atteint depuis le Tableau de bord (qui affiche déjà le radar). Simulateur & Mentors = V2 (flag).
const NAV: NavItem[] = [
  { href: routes.dashboard, label: "Tableau de bord", shortLabel: "Accueil", icon: "overview" },
  { href: routes.academy, label: "Workshop", icon: "academy" },
  { href: routes.studio, label: "Studio", icon: "studio" },
  ...(features.pitchSimulator
    ? [{ href: routes.pitchSim, label: "Simulateur", shortLabel: "Pitch", icon: "pitch" } as NavItem]
    : []),
  { href: routes.opportunities, label: "Opportunités", shortLabel: "Opports", icon: "opportunities" },
  ...(features.mentors
    ? [{ href: routes.mentors, label: "Mentors", icon: "mentors" } as NavItem]
    : []),
  { href: routes.profile, label: "Mon profil", shortLabel: "Profil", icon: "profile" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect(routes.login);
  // Profilage progressif (CRO) : l'onboarding n'est plus un MUR. Un porteur qui vient
  // de faire un diagnostic anonyme doit atteindre son bilan sans détour. L'onboarding
  // reste proposé (redirection post-inscription + bandeau doux sur le dashboard), mais
  // il est skippable — on ne bloque jamais l'accès à l'espace.

  return (
    <SessionProvider session={session}>
      <AppShell
        spaceLabel="Espace porteur"
        nav={NAV}
        user={{ name: session.name, roleLabel: "Porteur" }}
        signOutAction={signOut}
      >
        {children}
      </AppShell>
    </SessionProvider>
  );
}
