"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Button, toast } from "@/shared/ui";
import { completeLesson } from "../actions";
import type { LessonDetail } from "../api";

/** Lecture d'une leçon (contenu réel). Le bouton « terminé » écrit la progression. */
export function LessonView({
  lesson,
  completed,
}: {
  lesson: LessonDetail;
  completed: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(completed);

  const paragraphs = lesson.body.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  function markDone() {
    startTransition(async () => {
      const res = await completeLesson(lesson.slug);
      if (res.ok) {
        setDone(true);
        toast.success("Leçon terminée ✦");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <article className="mx-auto max-w-2xl">
      <Button asChild variant="ghost" size="sm">
        <Link href={routes.academy}>
          <ArrowLeft className="size-4" />
          Academy
        </Link>
      </Button>

      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">{lesson.title}</h1>
      {lesson.topic ? (
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {lesson.topic}
        </p>
      ) : null}

      <div className="mt-8 space-y-4">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))
        ) : (
          <p className="leading-relaxed text-muted-foreground">{lesson.summary}</p>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
        <Button
          variant={done ? "outline" : "primary"}
          onClick={markDone}
          loading={pending}
          disabled={done}
        >
          <CheckCircle2 className="size-5" />
          {done ? "Terminé" : "Marquer comme terminé"}
        </Button>
        <Button asChild variant="ghost">
          <Link href={`${routes.academy}#construire`}>Construire ma version</Link>
        </Button>
      </div>
    </article>
  );
}
