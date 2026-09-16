"use client";

import Link from "next/link";
import DeleteForm from "./DeleteForm";
import SortableAdminTable from "./SortableAdminTable";
import type { Project } from "@/types/project";

interface SortableProjectListProps {
  initialProjects: Project[];
  type: "coding" | "drawing";
  onToggleVisibility: (id: string, currentVisibility: boolean) => Promise<void>;
}

export default function SortableProjectList({
  initialProjects,
  type,
  onToggleVisibility,
}: SortableProjectListProps) {
  async function handleReorder(projectIds: string[]) {
    const response = await fetch("/api/projects/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, projectIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to save order");
    }
  }

  return (
    <SortableAdminTable
      initialItems={initialProjects}
      onReorder={handleReorder}
      columns={[
        {
          header: "Title",
          cell: (project) => (
            <div>
              <span className="text-white">{project.title}</span>
              <span className="text-white-1 text-sm ml-2">({project.slug})</span>
            </div>
          ),
        },
        {
          header: "Status",
          headerClassName: "w-24 px-4 py-3 text-left text-white-1 font-normal",
          cellClassName: "w-24 px-4 py-3",
          cell: (project) => (
            <button
              type="button"
              onClick={() => onToggleVisibility(project.id, project.is_visible)}
              className={`px-2 py-1 rounded text-sm ${
                project.is_visible
                  ? "bg-green-900/50 text-green-300"
                  : "bg-red-900/50 text-red-300"
              }`}
            >
              {project.is_visible ? "Visible" : "Hidden"}
            </button>
          ),
        },
        {
          header: "Actions",
          headerClassName: "w-32 px-4 py-3 text-right text-white-1 font-normal",
          cellClassName: "w-32 px-4 py-3 text-right",
          cell: (project) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/admin/projects/${project.id}/edit`}
                className="text-pink hover:underline text-sm"
              >
                Edit
              </Link>
              <DeleteForm
                action="/api/projects/delete"
                id={project.id}
                message={`Are you sure you want to delete "${project.title}"?`}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
