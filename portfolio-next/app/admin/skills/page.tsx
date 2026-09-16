import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SortableSkillList from "@/components/admin/SortableSkillList";
import type { Skill } from "@/types/skill";

export default async function AdminSkillsPage() {
  const supabase = await createClient();

  const { data: skills, error } = await supabase
    .from("skills")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="text-red-400">Error loading skills: {error.message}</div>
    );
  }

  const allSkills = (skills || []) as Skill[];
  const systemsSkills = allSkills.filter((s) => s.category === "systems");
  const developmentSkills = allSkills.filter((s) => s.category === "development");

  return (
    <div>
      <div className="flex items-center justify-between mb-4 admin-header">
        <h1 className="text-large font-heading text-white">Skills</h1>
        <Link href="/admin/skills/new" className="btn">
          + Add Skill
        </Link>
      </div>

      <section className="admin-section mb-6">
        <h2 className="text-medium-1 font-heading text-white mb-2">
          Systems Skills ({systemsSkills.length})
        </h2>
        <p className="text-white-1 text-sm mb-3">Drag rows to reorder</p>
        <SortableSkillList initialSkills={systemsSkills} category="systems" />
      </section>

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
    </div>
  );
}
