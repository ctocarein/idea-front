import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { ApiError } from "@/shared/api/client";
import { Badge } from "@/shared/ui";
import { getAcademyProgress, getLessons } from "../api";

/** Liste des leçons pédagogiques (vue Academy). Données réelles + état terminé. */
export async function AcademyModules() {
  let lessons: Awaited<ReturnType<typeof getLessons>> = [];
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

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {lessons.map((lesson) => {
        const done = completedIds.has(lesson.id);
        return (
          <Link
            key={lesson.id}
            href={`${routes.academy}/${lesson.slug}`}
            className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-coral-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
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
      })}
    </div>
  );
}
