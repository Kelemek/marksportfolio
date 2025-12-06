import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CertificateForm from "@/components/admin/CertificateForm";
import Link from "next/link";
import type { Certificate } from "@/types/certificate";

interface EditCertificatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCertificatePage({
  params,
}: EditCertificatePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: certificate, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !certificate) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/certificates"
          className="text-pink hover:underline text-sm"
        >
          ← Back to Certificates
        </Link>
      </div>
      <h1 className="text-large font-heading text-white mb-6">
        Edit Certificate
      </h1>
      <CertificateForm certificate={certificate as Certificate} mode="edit" />
    </div>
  );
}
