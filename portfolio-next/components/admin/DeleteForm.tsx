"use client";

interface DeleteFormProps {
  action: string;
  id: string;
  label?: string;
  message?: string;
}

export default function DeleteForm({ action, id, label = "Delete", message }: DeleteFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(message ?? "Are you sure you want to delete this item?")) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} method="POST" onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-red-400 hover:underline text-sm">
        {label}
      </button>
    </form>
  );
}
