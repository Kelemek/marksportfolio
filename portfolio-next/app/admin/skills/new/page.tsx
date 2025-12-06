import SkillForm from "@/components/admin/SkillForm";
import Link from "next/link";

export default function NewSkillPage() {
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
      <h1 className="text-large font-heading text-white mb-6">Add New Skill</h1>
      <SkillForm mode="create" />
    </div>
  );
}
