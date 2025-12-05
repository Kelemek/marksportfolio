import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="text-large font-heading text-white mb-8">
        Add New Project
      </h1>
      <ProjectForm mode="create" />
    </div>
  );
}
