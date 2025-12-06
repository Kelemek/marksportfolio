"use client";

import { useRouter } from "next/navigation";
import SortableCertificateList from "./SortableCertificateList";
import type { Certificate } from "@/types/certificate";

interface AdminCertificatesClientProps {
  educationCertificates: Certificate[];
  scrimbaCertificates: Certificate[];
}

export default function AdminCertificatesClient({
  educationCertificates,
  scrimbaCertificates,
}: AdminCertificatesClientProps) {
  const router = useRouter();

  return (
    <>
      {/* Education Certificates */}
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

      {/* Scrimba Certificates */}
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
    </>
  );
}
