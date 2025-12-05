import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AdminProjectsClient from "@/components/admin/AdminProjectsClient";
import type { Project } from "@/types/project";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("type", { ascending: true })
    .order("display_order", { ascending: true });

  if (error) {
    return (
      <div className="text-red-400">
        Error loading projects: {error.message}
      </div>
    );
  }

  const allProjects = (projects || []) as Project[];
  const codingProjects = allProjects.filter((p) => p.type === "coding");
  const drawingProjects = allProjects.filter((p) => p.type === "drawing");

  return (
    <div>
      <div className="flex items-center justify-between mb-4 admin-header">
        <h1 className="text-large font-heading text-white">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="btn"
        >
          + Add Project
        </Link>
      </div>

      <AdminProjectsClient
        codingProjects={codingProjects}
        drawingProjects={drawingProjects}
      />
    </div>
  );
}
