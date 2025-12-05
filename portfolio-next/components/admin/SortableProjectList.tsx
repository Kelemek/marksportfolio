"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import type { Project } from "@/types/project";

interface SortableProjectListProps {
  initialProjects: Project[];
  type: "coding" | "drawing";
  onToggleVisibility: (id: string, currentVisibility: boolean) => Promise<void>;
}

interface SortableRowProps {
  project: Project;
  onToggleVisibility: (id: string, currentVisibility: boolean) => Promise<void>;
}

function SortableRow({ project, onToggleVisibility }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-t border-black/30 bg-border-light"
    >
      <td className="w-12 px-2 py-3 text-white-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded"
          title="Drag to reorder"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M2 4h12v1H2V4zm0 3.5h12v1H2v-1zm0 3.5h12v1H2v-1z" />
          </svg>
        </button>
      </td>
      <td className="px-4 py-3">
        <div>
          <span className="text-white">{project.title}</span>
          <span className="text-white-1 text-sm ml-2">({project.slug})</span>
        </div>
      </td>
      <td className="w-24 px-4 py-3">
        <button
          onClick={() => onToggleVisibility(project.id, project.is_visible)}
          className={`px-2 py-1 rounded text-sm ${
            project.is_visible
              ? "bg-green-900/50 text-green-300"
              : "bg-red-900/50 text-red-300"
          }`}
        >
          {project.is_visible ? "Visible" : "Hidden"}
        </button>
      </td>
      <td className="w-32 px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/projects/${project.id}/edit`}
            className="text-pink hover:underline text-sm"
          >
            Edit
          </Link>
          <DeleteButton projectId={project.id} projectTitle={project.title} />
        </div>
      </td>
    </tr>
  );
}

export default function SortableProjectList({
  initialProjects,
  type,
  onToggleVisibility,
}: SortableProjectListProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);

      const newOrder = arrayMove(projects, oldIndex, newIndex);
      setProjects(newOrder);

      // Save new order to database
      setSaving(true);
      try {
        const response = await fetch("/api/projects/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            projectIds: newOrder.map((p) => p.id),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save order");
        }
      } catch (error) {
        console.error("Error saving order:", error);
        // Revert on error
        setProjects(initialProjects);
      } finally {
        setSaving(false);
      }
    }
  }

  return (
    <div className="relative">
      {saving && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
          <span className="text-white">Saving...</span>
        </div>
      )}
      <div className="bg-border-light rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/50">
            <tr>
              <th className="w-12 px-2 py-3 text-left text-white-1 font-normal">
                <span className="sr-only">Drag</span>
              </th>
              <th className="px-4 py-3 text-left text-white-1 font-normal">
                Title
              </th>
              <th className="w-24 px-4 py-3 text-left text-white-1 font-normal">
                Status
              </th>
              <th className="w-32 px-4 py-3 text-right text-white-1 font-normal">
                Actions
              </th>
            </tr>
          </thead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={projects.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {projects.map((project) => (
                  <SortableRow
                    key={project.id}
                    project={project}
                    onToggleVisibility={onToggleVisibility}
                  />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
}
