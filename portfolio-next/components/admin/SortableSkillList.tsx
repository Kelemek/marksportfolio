"use client";

import Link from "next/link";
import DeleteForm from "./DeleteForm";
import SortableAdminTable from "./SortableAdminTable";
import type { Skill } from "@/types/skill";

interface SortableSkillListProps {
  initialSkills: Skill[];
  category: "systems" | "development";
}

export default function SortableSkillList({
  initialSkills,
  category,
}: SortableSkillListProps) {
  async function handleReorder(skillIds: string[]) {
    const response = await fetch("/api/skills/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, skillIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to save order");
    }
  }

  return (
    <SortableAdminTable
      initialItems={initialSkills}
      onReorder={handleReorder}
      columns={[
        {
          header: "Name",
          cell: (skill) => <span className="text-white">{skill.name}</span>,
        },
        {
          header: "Years",
          headerClassName: "w-32 px-4 py-3 text-left text-white-1 font-normal",
          cellClassName: "w-32 px-4 py-3",
          cell: (skill) => <span className="text-white-1">{skill.years}</span>,
        },
        {
          header: "Actions",
          headerClassName: "w-32 px-4 py-3 text-right text-white-1 font-normal",
          cellClassName: "w-32 px-4 py-3 text-right",
          cell: (skill) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/admin/skills/${skill.id}/edit`}
                className="text-pink hover:underline text-sm"
              >
                Edit
              </Link>
              <DeleteForm
                action="/api/skills/delete"
                id={skill.id}
                message={`Delete "${skill.name}"?`}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
