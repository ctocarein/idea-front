import { redirect } from "next/navigation";

import { routes } from "@/shared/config/routes";
import { features } from "@/shared/config/features";
import { getSession } from "@/shared/auth/server";
import { SessionProvider } from "@/shared/auth";
import { AppShell, type NavItem } from "@/shared/layout";
import { signOut } from "@/features/auth";

// Simulateur de pitch et Mentors sont repoussés en V2 → masqués par flag.
const NAV: NavItem[] = [
  { href: routes.dashboard, label: "Tableau de bord", shortLabel: "Accueil", icon: "overview" },
  { href: routes.academy, label: "Workshop", icon: "academy" },
  { href: routes.besoins, label: "Mes besoins", shortLabel: "Besoins", icon: "needs" },
  ...(features.pitchSimulator
    ? [{ href: routes.pitchSim, label: "Simulateur", shortLabel: "Pitch", icon: "pitch" } as NavItem]
    : []),
  { href: routes.opportunities, label: "Opportunités", shortLabel: "Opports", icon: "opportunities" },
  ...(features.mentors
    ? [{ href: routes.mentors, label: "Mentors", icon: "mentors" } as NavItem]
    : []),
  { href: routes.readiness, label: "Readiness", shortLabel: "Prêt ?", icon: "readiness" },
  { href: routes.shares, label: "Partages", icon: "share" },
  { href: routes.profile, label: "Mon profil", shortLabel: "Profil", icon: "profile" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect(routes.login);
  // Porteurs nouvellement inscrits → onboarding obligatoire avant le dashboard.
  // Les autres rôles (admin, mentor, analyst) n'ont pas d'onboarding.
  // On défault à true si le champ est absent (sessions antérieures à la feature).
  if (session.role === "founder" && (session.onboarding_completed ?? true) === false) {
    redirect(routes.onboarding);
  }

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
