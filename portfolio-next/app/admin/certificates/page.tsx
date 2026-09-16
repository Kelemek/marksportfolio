import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SortableCertificateList from "@/components/admin/SortableCertificateList";
import type { Certificate } from "@/types/certificate";

export default async function AdminCertificatesPage() {
  const supabase = await createClient();

  const { data: certificates, error } = await supabase
    .from("certificates")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="text-red-400">
        Error loading certificates: {error.message}
      </div>
    );
  }

  const allCertificates = (certificates || []) as Certificate[];
  const educationCertificates = allCertificates.filter(
    (c) => c.category === "education"
  );
  const scrimbaCertificates = allCertificates.filter(
    (c) => c.category === "scrimba"
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4 admin-header">
        <h1 className="text-large font-heading text-white">Certificates</h1>
        <Link href="/admin/certificates/new" className="btn">
          + Add Certificate
        </Link>
      </div>

      <section className="admin-section mb-6">
        <h2 className="text-medium-1 font-heading text-white mb-2">
          Education ({educationCertificates.length})
        </h2>
        <p className="text-white-1 text-sm mb-3">Drag rows to reorder</p>
        <SortableCertificateList
          initialCertificates={educationCertificates}
          category="education"
        />
      </section>

      <section className="admin-section">
        <h2 className="text-medium-1 font-heading text-white mb-2">
          Scrimba Certificates ({scrimbaCertificates.length})
        </h2>
        <p className="text-white-1 text-sm mb-3">Drag rows to reorder</p>
        <SortableCertificateList
          initialCertificates={scrimbaCertificates}
          category="scrimba"
        />
      </section>
    </div>
  );
}
