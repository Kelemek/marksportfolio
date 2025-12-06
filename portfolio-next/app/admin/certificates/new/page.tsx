import CertificateForm from "@/components/admin/CertificateForm";
import Link from "next/link";

export default function NewCertificatePage() {
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
        Add New Certificate
      </h1>
      <CertificateForm mode="create" />
    </div>
  );
}
