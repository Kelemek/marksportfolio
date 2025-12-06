import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import JobForm from "@/components/admin/JobForm";
import Link from "next/link";
import type { Job } from "@/types/job";

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !job) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/jobs" className="text-pink hover:underline text-sm">
          ← Back to Jobs
        </Link>
      </div>
      <h1 className="text-large font-heading text-white mb-6">Edit Job</h1>
      <JobForm job={job as Job} mode="edit" />
    </div>
  );
}
