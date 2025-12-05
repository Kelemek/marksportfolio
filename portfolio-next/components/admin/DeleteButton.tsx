"use client";

interface DeleteButtonProps {
  projectId: string;
  projectTitle: string;
}

export default function DeleteButton({ projectId, projectTitle }: DeleteButtonProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"?`)) {
      e.preventDefault();
    }
  };

  return (
    <form action="/api/projects/delete" method="POST" onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={projectId} />
      <button
        type="submit"
        className="text-red-400 hover:underline text-sm"
      >
        Delete
      </button>
    </form>
  );
}
