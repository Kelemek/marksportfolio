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
import type { Skill } from "@/types/skill";

interface SortableSkillListProps {
  initialSkills: Skill[];
  category: "systems" | "development";
}

interface SortableRowProps {
  skill: Skill;
}

function SortableRow({ skill }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id });

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
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-sm"
          title="Drag to reorder"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 4h12v1H2V4zm0 3.5h12v1H2v-1zm0 3.5h12v1H2v-1z" />
          </svg>
        </button>
      </td>
      <td className="px-4 py-3">
        <span className="text-white">{skill.name}</span>
      </td>
      <td className="w-32 px-4 py-3">
        <span className="text-white-1">{skill.years}</span>
      </td>
      <td className="w-32 px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/skills/${skill.id}/edit`}
            className="text-pink hover:underline text-sm"
          >
            Edit
          </Link>
          <form action="/api/skills/delete" method="POST" className="inline">
            <input type="hidden" name="id" value={skill.id} />
            <button
              type="submit"
              className="text-red-400 hover:underline text-sm"
              onClick={(e) => {
                if (!confirm(`Delete "${skill.name}"?`)) {
                  e.preventDefault();
                }
              }}
            >
              Delete
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}

export default function SortableSkillList({
  initialSkills,
  category,
}: SortableSkillListProps) {
  const [skills, setSkills] = useState(initialSkills);
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
      const oldIndex = skills.findIndex((s) => s.id === active.id);
      const newIndex = skills.findIndex((s) => s.id === over.id);

      const newOrder = arrayMove(skills, oldIndex, newIndex);
      setSkills(newOrder);

      // Save new order to database
      setSaving(true);
      try {
        const response = await fetch("/api/skills/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            skillIds: newOrder.map((s) => s.id),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save order");
        }
      } catch (error) {
        console.error("Error saving order:", error);
        // Revert on error
        setSkills(initialSkills);
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={skills.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="bg-border-light rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/50">
                <tr>
                  <th className="w-12 px-2 py-3 text-left text-white-1 font-normal">
                    <span className="sr-only">Drag</span>
                  </th>
                  <th className="px-4 py-3 text-left text-white-1 font-normal">
                    Name
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-white-1 font-normal">
                    Years
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-white-1 font-normal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <SortableRow key={skill.id} skill={skill} />
                ))}
              </tbody>
            </table>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
