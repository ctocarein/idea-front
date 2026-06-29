import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { ApiError } from "@/shared/api/client";
import { Badge } from "@/shared/ui";
import { getAcademyProgress, getLessons, type LessonSummary } from "../api";

/**
 * Liste des leçons pédagogiques (vue Academy). Données réelles + état terminé.
 *
 * `highlightTopic` : si fourni (depuis `?topic=X`), les leçons correspondantes sont
 * affichées en premier avec un bandeau de recommandation contextuelle.
 */
export async function AcademyModules({ highlightTopic }: { highlightTopic?: string } = {}) {
  let lessons: LessonSummary[] = [];
  let completedIds = new Set<string>();
  try {
    const [list, progress] = await Promise.all([getLessons(), getAcademyProgress()]);
    lessons = list;
    completedIds = new Set(progress.completed_lesson_ids);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  if (lessons.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Les leçons arrivent bientôt — on construit le contenu.
      </p>
    );
  }

  const highlighted = highlightTopic ? lessons.filter((l) => l.topic === highlightTopic) : [];
  const rest = highlightTopic ? lessons.filter((l) => l.topic !== highlightTopic) : lessons;

  return (
    <div className="space-y-6">
      {highlighted.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-coral-strong" />
            <p className="text-sm font-semibold text-coral-strong">
              Recommandé pour renforcer cet axe
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {highlighted.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} done={completedIds.has(lesson.id)} highlight />
            ))}
          </div>
          {rest.length > 0 ? (
            <p className="pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Tous les modules
            </p>
          ) : null}
        </div>
      ) : null}

      {rest.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {rest.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} done={completedIds.has(lesson.id)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LessonCard({
  lesson,
  done,
  highlight = false,
}: {
  lesson: LessonSummary;
  done: boolean;
  highlight?: boolean;
}) {
  return (
    <Link
      href={`${routes.academy}/${lesson.slug}`}
      className={[
        "group rounded-2xl border bg-card p-5 transition-colors hover:border-coral-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
        highlight ? "border-coral-strong/50 ring-1 ring-coral-strong/20" : "border-border",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-bold">{lesson.title}</h3>
        {done ? (
          <Badge variant="success">
            <CheckCircle2 className="size-3.5" /> Terminé
          </Badge>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{lesson.summary}</p>
      {lesson.topic ? (
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {lesson.topic}
        </p>
      ) : null}
    </Link>
  );
}
