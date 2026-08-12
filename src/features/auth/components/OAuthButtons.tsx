"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";

import { Button } from "@/shared/ui";
import { ENABLED_OAUTH_PROVIDERS, safeNext, type OAuthProvider } from "@/shared/auth/oauth";

/** Marque Google — quatre couleurs officielles, jamais recolorée. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

/** Marque LinkedIn — bleu officiel #0A66C2. */
function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden focusable="false">
      <path
        fill="#0A66C2"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  );
}

const MARKS: Record<OAuthProvider, () => React.ReactElement> = {
  google: GoogleMark,
  linkedin: LinkedInMark,
};

/** Codes d'erreur posés par le Route Handler de retour (`/api/auth/oauth/callback`). */
const ERROR_KEYS = ["oauth_denied", "oauth_conflict", "oauth_failed", "oauth_missing_code", "oauth_provider"];

function OAuthButtonsInner() {
  const t = useTranslations("Auth.oauth");
  const params = useSearchParams();

  // Le proxy pose `?next=` quand il intercepte une page gardée : on le rend au parcours OAuth.
  const next = safeNext(params.get("next"));
  const error = params.get("error");
  const errorKey = error && ERROR_KEYS.includes(error) ? error : null;

  return (
    <div className="space-y-4">
      {errorKey && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{t(`errors.${errorKey}`)}</span>
        </div>
      )}

      {ENABLED_OAUTH_PROVIDERS.length > 0 && (
        <>
          <div className="space-y-2.5">
            {ENABLED_OAUTH_PROVIDERS.map((provider) => {
              const Mark = MARKS[provider];
              const href = next
                ? `/api/auth/oauth/${provider}?next=${encodeURIComponent(next)}`
                : `/api/auth/oauth/${provider}`;
              return (
                <Button key={provider} asChild variant="outline" className="w-full">
                  {/* Navigation serveur volontaire (<a> et non <Link>) : la route BFF sort du routeur. */}
                  <a href={href}>
                    <Mark />
                    {t("continueWith", { provider: t(`providers.${provider}`) })}
                  </a>
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("or")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Connexion par Google ou LinkedIn. Les boutons pointent vers notre propre BFF, jamais vers
 * le backend ni vers le fournisseur : c'est le serveur qui compose l'URL d'autorisation.
 *
 * `useSearchParams` impose une frontière Suspense — elle est portée ici pour que les pages
 * d'auth restent de simples Server Components.
 */
export function OAuthButtons() {
  return (
    <Suspense fallback={<div className="h-[104px]" />}>
      <OAuthButtonsInner />
    </Suspense>
  );
}
