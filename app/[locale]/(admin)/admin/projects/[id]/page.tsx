import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiError } from "@/shared/api/client";
import { ProjectDetail } from "@/features/projects";
import { getAdminProject } from "@/features/projects/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const project = await getAdminProject(id);
    return { title: project.name };
  } catch {
    return { title: "Projet" };
  }
}

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let project;
  try {
    project = await getAdminProject(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  return <ProjectDetail project={project} />;
}
