import Link from "next/link";
import {
  ArrowRight,
  Compass,
  GraduationCap,
  HeartHandshake,
  Mic,
  Rocket,
  ShieldCheck,
} from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import { Reveal } from "@/shared/motion";
import { RadarChart, sampleScore } from "@/features/scoring";

const STEPS = [
  {
    icon: Compass,
    title: "Comprendre",
    text: "Un diagnostic produit ton tableau de compréhension : essence, viabilité, scalabilité.",
  },
  {
    icon: GraduationCap,
    title: "Apprendre",
    text: "L'Academy t'explique le BP, le pitch, le modèle éco — et tu construis ta version, guidé.",
  },
  {
    icon: Mic,
    title: "S'exercer",
    text: "Le simulateur de pitch te fait affronter les vraies questions, sans peur, autant que tu veux.",
  },
];

const STATS = [
  { value: "100 %", label: "du parcours porteur, gratuit" },
  { value: "6", label: "axes pour comprendre ton projet" },
  { value: "∞", label: "répétitions au simulateur" },
];

const AUDIENCES = [
  {
    icon: Rocket,
    title: "Porteurs",
    text: "Comprends, apprends, entraîne-toi — et décide toi-même d'aller plus loin.",
    href: routes.startups,
    cta: "Découvrir le parcours",
  },
  {
    icon: HeartHandshake,
    title: "Mentors",
    text: "Sois choisi par les porteurs que tu peux vraiment faire progresser.",
    href: routes.login,
    cta: "Rejoindre",
  },
  {
    icon: ShieldCheck,
    title: "Financeurs",
    text: "Ne voyez que des dossiers réellement préparés et qualifiés.",
    href: routes.financeurs,
    cta: "En savoir plus",
  },
];

const FAQ = [
  {
    q: "Pourquoi c'est gratuit ?",
    a: "On construit d'abord la valeur. Tout le parcours porteur — diagnostic, academy, simulateur — est gratuit. L'accompagnement et la certification viendront ensuite, prouvés.",
  },
  {
    q: "L'IA fait-elle le travail à ma place ?",
    a: "Non. Elle t'explique et te questionne ; c'est toi qui écris. Tu restes l'auteur de ton projet — c'est comme ça que tu t'en empares.",
  },
  {
    q: "Et si mon idée n'est pas mûre ?",
    a: "C'est le point de départ idéal. On part d'où tu es, sans jugement.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-grid">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-24 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Capable et confiant
            </p>
            <h1 className="mt-4 font-display text-[34px] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              De l&apos;idée confuse au projet que tu sais défendre.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Ideaxion t&apos;aide d&apos;abord à comprendre ton projet, puis à
              le rendre solide. Gratuitement. Le capital vient après — jamais
              devant.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href={routes.diagnostic}>
                  Lancer mon diagnostic
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={routes.startups}>Comment ça marche</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex justify-center">
            <RadarChart score={sampleScore} size={440} />
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-5 py-10 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="tabular font-display text-3xl font-extrabold text-ink">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* La vraie douleur */}
      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <Reveal>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            La première douleur n&apos;est pas le manque d&apos;argent.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            C&apos;est l&apos;impuissance : comprendre comment ça marche,
            structurer son projet, monter un pitch, perdre la peur. On construit
            le moteur qui t&apos;y amène.
          </p>
        </Reveal>
      </section>

      {/* Les 3 étapes */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <span className="flex size-12 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
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
              Pour qui ?
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {AUDIENCES.map((a, i) => {
              const Icon = a.icon;
              return (
                <Reveal key={a.title} delay={i * 0.08}>
                  <div className="flex h-full flex-col rounded-2xl border border-border bg-background p-6">
                    <span className="flex size-11 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold">
                      {a.title}
                    </h3>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">
                      {a.text}
                    </p>
                    <Link
                      href={a.href}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-coral-strong hover:underline"
                    >
                      {a.cta}
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
            Questions fréquentes
          </h2>
        </Reveal>
        <dl className="mt-8 space-y-4">
          {FAQ.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <dt className="font-display text-base font-bold">{f.q}</dt>
              <dd className="mt-1.5 text-sm text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="flex flex-col items-center gap-5 rounded-2xl bg-ink px-6 py-12 text-center text-white">
          <h2 className="max-w-xl font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Ton projet mérite d&apos;être compris avant d&apos;être jugé.
          </h2>
          <Button asChild variant="primary">
            <Link href={routes.diagnostic}>
              Commencer, gratuitement
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
