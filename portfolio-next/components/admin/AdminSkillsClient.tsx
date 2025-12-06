"use client";

import { useRouter } from "next/navigation";
import SortableSkillList from "./SortableSkillList";
import type { Skill } from "@/types/skill";

interface AdminSkillsClientProps {
  systemsSkills: Skill[];
  developmentSkills: Skill[];
}

export default function AdminSkillsClient({
  systemsSkills,
  developmentSkills,
}: AdminSkillsClientProps) {
  const router = useRouter();

  return (
    <>
      {/* Systems Skills */}
      <section className="admin-section mb-6">
        <h2 className="text-medium-1 font-heading text-white mb-2">
          Systems Skills ({systemsSkills.length})
        </h2>
        <p className="text-white-1 text-sm mb-3">Drag rows to reorder</p>
        <SortableSkillList initialSkills={systemsSkills} category="systems" />
      </section>

      {/* Development Skills */}
      <section className="admin-section">
        <h2 className="text-medium-1 font-heading text-white mb-2">
          Development Skills ({developmentSkills.length})
        </h2>
        <p className="text-white-1 text-sm mb-3">Drag rows to reorder</p>
        <SortableSkillList
          initialSkills={developmentSkills}
          category="development"
        />
      </section>
    </>
  );
}
