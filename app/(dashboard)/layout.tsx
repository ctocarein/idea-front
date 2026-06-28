import { redirect } from "next/navigation";

import { routes } from "@/shared/config/routes";
import { getSession } from "@/shared/auth/server";
import { SessionProvider } from "@/shared/auth";
import { AppShell, type NavItem } from "@/shared/layout";
import { signOut } from "@/features/auth";

const NAV: NavItem[] = [
  { href: routes.dashboard, label: "Tableau de bord", shortLabel: "Accueil", icon: "overview" },
  { href: routes.academy, label: "Academy", icon: "academy" },
  { href: routes.pitchSim, label: "Simulateur", shortLabel: "Pitch", icon: "pitch" },
  { href: routes.opportunities, label: "Opportunités", shortLabel: "Opports", icon: "opportunities" },
  { href: routes.mentors, label: "Mentors", icon: "mentors" },
  { href: routes.readiness, label: "Readiness", shortLabel: "Prêt ?", icon: "readiness" },
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
