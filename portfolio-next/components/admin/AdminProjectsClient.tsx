"use client";

import { useRouter } from "next/navigation";
import SortableProjectList from "./SortableProjectList";
import type { Project } from "@/types/project";

interface AdminProjectsClientProps {
  codingProjects: Project[];
  drawingProjects: Project[];
}

export default function AdminProjectsClient({
  codingProjects,
  drawingProjects,
}: AdminProjectsClientProps) {
  const router = useRouter();

  async function handleToggleVisibility(id: string, currentVisibility: boolean) {
    try {
      const response = await fetch("/api/projects/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_visible: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle visibility");
      }

      router.refresh();
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  }

  return (
    <>
      {/* Coding Projects */}
      <section className="admin-section mb-6">
        <h2 className="text-medium-1 font-heading text-white mb-2">
          Coding Projects ({codingProjects.length})
        </h2>
        <p className="text-white-1 text-sm mb-3">
          Drag rows to reorder
        </p>
        <SortableProjectList
          initialProjects={codingProjects}
          type="coding"
          onToggleVisibility={handleToggleVisibility}
        />
      </section>

      {/* Drawing Projects */}
      <section className="admin-section">
        <h2 className="text-medium-1 font-heading text-white mb-2">
          Drawing Projects ({drawingProjects.length})
        </h2>
        <p className="text-white-1 text-sm mb-3">
          Drag rows to reorder
        </p>
        <SortableProjectList
          initialProjects={drawingProjects}
          type="drawing"
          onToggleVisibility={handleToggleVisibility}
        />
      </section>
    </>
  );
}
