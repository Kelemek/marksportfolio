import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AdminSkillsClient from "@/components/admin/AdminSkillsClient";
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

      <AdminSkillsClient
        systemsSkills={systemsSkills}
        developmentSkills={developmentSkills}
      />
    </div>
  );
}
