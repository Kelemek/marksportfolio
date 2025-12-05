import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-large font-heading text-white mb-8">
        Edit Project: {project.title}
      </h1>
      <ProjectForm project={project} mode="edit" />
    </div>
  );
}
