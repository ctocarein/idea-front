import { redirect } from "next/navigation";

import { routes } from "@/shared/config/routes";
import { getSession } from "@/shared/auth/server";
import { SessionProvider, SPACE_ROLES } from "@/shared/auth";
import { AppShell, type NavItem } from "@/shared/layout";
import { signOut } from "@/features/auth";

const NAV: NavItem[] = [
  { href: routes.mentorHome, label: "Mon profil", icon: "profile" },
  { href: `${routes.mentorHome}/requests`, label: "Demandes", icon: "requests" },
];

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect(routes.login);
  if (!SPACE_ROLES["/mentor"].includes(session.role))
    redirect(routes.forbidden);

  return (
    <SessionProvider session={session}>
      <AppShell
        spaceLabel="Espace mentor"
        nav={NAV}
        user={{ name: session.name, roleLabel: "Mentor" }}
        signOutAction={signOut}
      >
        {children}
      </AppShell>
    </SessionProvider>
  );
}
