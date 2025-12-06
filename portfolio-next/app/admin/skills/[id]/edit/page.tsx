import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SkillForm from "@/components/admin/SkillForm";
import Link from "next/link";
import type { Skill } from "@/types/skill";

interface EditSkillPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSkillPage({ params }: EditSkillPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: skill, error } = await supabase
    .from("skills")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !skill) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/skills"
          className="text-pink hover:underline text-sm"
        >
          ← Back to Skills
        </Link>
      </div>
      <h1 className="text-large font-heading text-white mb-6">Edit Skill</h1>
      <SkillForm skill={skill as Skill} mode="edit" />
    </div>
  );
}
