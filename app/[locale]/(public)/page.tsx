import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Compass,
  GraduationCap,
  HeartHandshake,
  Lock,
  Mic,
  PenLine,
  Rocket,
  ShieldCheck,
} from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import { Reveal } from "@/shared/motion";
import { AnimatedRadarHero } from "@/features/scoring";

// Structure = code (icônes, liens) ; textes dans les catalogues (Home.*).
const STEPS = [
  { icon: Compass, id: "understand" },
  { icon: GraduationCap, id: "learn" },
  { icon: Mic, id: "practice" },
] as const;

const STATS = [
  { value: "100 %", key: "free" },
  { value: "12", key: "dimensions" },
  { value: "∞", key: "reps" },
] as const;

const TRUST = [
  { icon: Lock, id: "private" },
  { icon: PenLine, id: "author" },
  { icon: BadgeCheck, id: "noCommit" },
] as const;

const AUDIENCES = [
  { icon: Rocket, id: "founders", href: routes.startups },
  { icon: HeartHandshake, id: "mentors", href: routes.login },
  { icon: ShieldCheck, id: "financiers", href: routes.financeurs },
] as const;

const FAQ = ["free", "ai", "maturity"] as const;

export default function Home() {
  const t = useTranslations("Home");
  return (
    <>
      {/* Hero */}
      <section className="bg-grid">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-24 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t("eyebrow")}
            </p>
            <h1 className="mt-4 font-display text-[34px] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              {t.rich("subtitle", { b: (chunks) => <b>{chunks}</b> })}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href={routes.diagnostic}>
                  {t("ctaPrimary")}
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={routes.startups}>{t("ctaSecondary")}</Link>
              </Button>
            </div>
            {/* Rassurance : lève la friction avant le clic (valeur · effort · zéro engagement). */}
            <p className="mt-3 text-sm text-muted-foreground">{t("reassurance")}</p>
          </Reveal>

          <Reveal delay={0.1} className="flex justify-center">
            <AnimatedRadarHero size={440} />
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-5 py-10 text-center">
          {STATS.map((s) => (
            <div key={s.key}>
              <p className="tabular font-display text-3xl font-extrabold text-ink">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {t(`stats.${s.key}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Réassurance : la peur n°1 d'un porteur = se faire voler son idée. On la lève d'entrée. */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 sm:grid-cols-3">
          {TRUST.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.id} delay={i * 0.08}>
                <div className="flex gap-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral-strong">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold">{t(`trust.${item.id}.title`)}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t(`trust.${item.id}.text`)}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* La vraie douleur */}
      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <Reveal>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {t("painTitle")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("painText")}</p>
        </Reveal>
      </section>

      {/* Les 3 étapes */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.id} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <span className="flex size-12 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold">
                    {t(`steps.${s.id}.title`)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t(`steps.${s.id}.text`)}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Pour qui */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <h2 className="text-center font-display text-2xl font-bold tracking-tight">
              {t("audiencesTitle")}
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {AUDIENCES.map((a, i) => {
              const Icon = a.icon;
              return (
                <Reveal key={a.id} delay={i * 0.08}>
                  <div className="flex h-full flex-col rounded-2xl border border-border bg-background p-6">
                    <span className="flex size-11 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold">
                      {t(`audiences.${a.id}.title`)}
                    </h3>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">
                      {t(`audiences.${a.id}.text`)}
                    </p>
                    <Link
                      href={a.href}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-coral-strong hover:underline"
                    >
                      {t(`audiences.${a.id}.cta`)}
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-16">
        <Reveal>
          <h2 className="text-center font-display text-2xl font-bold tracking-tight">
            {t("faqTitle")}
          </h2>
        </Reveal>
        <dl className="mt-8 space-y-4">
          {FAQ.map((id) => (
            <div key={id} className="rounded-2xl border border-border bg-card p-5">
              <dt className="font-display text-base font-bold">{t(`faq.${id}.q`)}</dt>
              <dd className="mt-1.5 text-sm text-muted-foreground">{t(`faq.${id}.a`)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="flex flex-col items-center gap-5 rounded-2xl bg-ink px-6 py-12 text-center text-white">
          <h2 className="max-w-xl font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("finalTitle")}
          </h2>
          <Button asChild variant="primary">
            <Link href={routes.diagnostic}>
              {t("finalCta")}
              <ArrowRight className="size-5" />
            </Link>
          </Button>
          <p className="text-sm text-white/70">{t("finalReassurance")}</p>
        </div>
      </section>
    </>
  );
}
