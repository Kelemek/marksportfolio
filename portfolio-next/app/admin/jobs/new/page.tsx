import JobForm from "@/components/admin/JobForm";
import Link from "next/link";

export default function NewJobPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/jobs" className="text-pink hover:underline text-sm">
          ← Back to Jobs
        </Link>
      </div>
      <h1 className="text-large font-heading text-white mb-6">Add New Job</h1>
      <JobForm mode="create" />
    </div>
  );
}
