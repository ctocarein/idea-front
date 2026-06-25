import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiError } from "@/shared/api/client";
import { LessonView } from "@/features/academy";
import { getAcademyProgress, getLessonDetail } from "@/features/academy/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const lesson = await getLessonDetail(id);
    return { title: lesson.title };
  } catch {
    return { title: "Leçon" };
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // id = slug de la leçon

  let lesson;
  try {
    lesson = await getLessonDetail(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  let completed = false;
  try {
    const progress = await getAcademyProgress();
    completed = progress.completed_lesson_ids.includes(lesson.id);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return <LessonView lesson={lesson} completed={completed} />;
}
