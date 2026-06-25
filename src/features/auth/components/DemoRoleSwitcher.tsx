"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Crown, GraduationCap, Rocket, UserCog } from "lucide-react";

import { toast } from "@/shared/ui";
import type { Role } from "@/shared/config/site";
import { signInAs } from "../api/actions";

const DEMO_ROLES: { role: Role; label: string; icon: typeof Rocket }[] = [
  { role: "founder", label: "Porteur", icon: Rocket },
  { role: "mentor", label: "Mentor", icon: GraduationCap },
  { role: "analyst", label: "Analyste", icon: UserCog },
  { role: "admin", label: "Admin", icon: Crown },
];

/**
 * Connexion rapide à un rôle de démo — via les comptes de seed du backend.
 * Pratique pour la recette ; à retirer/garder selon l'environnement.
 */
export function DemoRoleSwitcher() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function enter(role: Role) {
    startTransition(async () => {
      const res = await signInAs(role);
      if (res.ok) router.push(res.redirectTo);
      else toast.error(res.message);
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-muted-foreground">
        Démo — entrer directement comme&nbsp;:
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {DEMO_ROLES.map(({ role, label, icon: Icon }) => (
          <button
            key={role}
            type="button"
            onClick={() => enter(role)}
            disabled={pending}
            className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-3 text-xs font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 disabled:opacity-60"
          >
            <Icon className="size-5 text-muted-foreground" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
