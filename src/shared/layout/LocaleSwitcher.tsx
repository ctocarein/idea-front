"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { setLocalePreference } from "@/features/auth/api/actions";

/** Bascule FR/EN : navigue vers la même page dans l'autre langue + persiste la préférence. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();

  function switchTo(next: (typeof routing.locales)[number]) {
    if (next === locale || pending) return;
    start(() => {
      void setLocalePreference(next);
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border p-0.5 text-xs font-medium">
      <Globe className="ml-1.5 size-3.5 text-muted-foreground" aria-hidden />
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-full px-2 py-0.5 uppercase transition-colors ${
            l === locale ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
