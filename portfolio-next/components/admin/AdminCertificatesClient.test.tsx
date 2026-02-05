import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminCertificatesClient from './AdminCertificatesClient';
import type { Certificate } from '@/types/certificate';

// Mock dependencies
vi.mock('./SortableCertificateList', () => ({
  default: ({ initialCertificates, category }: { initialCertificates: Certificate[]; category: string }) => (
    <div data-testid={`sortable-${category}`}>
      {initialCertificates.map((cert) => (
        <div key={cert.id}>{cert.title}</div>
      ))}
    </div>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockEducationCerts: Certificate[] = [
  {
    id: '1',
    title: 'Bachelor of Science',
    institution: 'University',
    pdf_path: null,
    aria_label: null,
    category: 'education',
    sort_order: 1,
    created_at: '2020-05-15',
    updated_at: '2020-05-15',
  },
];

const mockScrimbaCrets: Certificate[] = [
  {
    id: '2',
    title: 'Advanced React',
    institution: 'Scrimba',
    pdf_path: null,
    aria_label: null,
    category: 'scrimba',
    sort_order: 1,
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
  },
];

describe('AdminCertificatesClient Component', () => {
  it('renders education certificates section', () => {
    render(
      <AdminCertificatesClient educationCertificates={mockEducationCerts} scrimbaCertificates={[]} />
    );
    expect(screen.getByText(/Education/)).toBeInTheDocument();
  });

  it('renders scrimba certificates section', () => {
    render(
      <AdminCertificatesClient educationCertificates={[]} scrimbaCertificates={mockScrimbaCrets} />
    );
    expect(screen.getByText(/Scrimba Certificates/)).toBeInTheDocument();
  });

  it('displays correct count for education certificates', () => {
    render(
      <AdminCertificatesClient educationCertificates={mockEducationCerts} scrimbaCertificates={[]} />
    );
    expect(screen.getByText('Education (1)')).toBeInTheDocument();
  });

  it('displays correct count for scrimba certificates', () => {
    render(
      <AdminCertificatesClient educationCertificates={[]} scrimbaCertificates={mockScrimbaCrets} />
    );
    expect(screen.getByText('Scrimba Certificates (1)')).toBeInTheDocument();
  });

  it('displays drag instructions for both sections', () => {
    render(
      <AdminCertificatesClient educationCertificates={mockEducationCerts} scrimbaCertificates={mockScrimbaCrets} />
    );
    const dragTexts = screen.getAllByText('Drag rows to reorder');
    expect(dragTexts).toHaveLength(2);
  });

  it('renders SortableCertificateList for education', () => {
    render(
      <AdminCertificatesClient educationCertificates={mockEducationCerts} scrimbaCertificates={[]} />
    );
    expect(screen.getByTestId('sortable-education')).toBeInTheDocument();
    expect(screen.getByText('Bachelor of Science')).toBeInTheDocument();
  });

  it('renders SortableCertificateList for scrimba', () => {
    render(
      <AdminCertificatesClient educationCertificates={[]} scrimbaCertificates={mockScrimbaCrets} />
    );
    expect(screen.getByTestId('sortable-scrimba')).toBeInTheDocument();
    expect(screen.getByText('Advanced React')).toBeInTheDocument();
  });

  it('displays zero counts when no certificates', () => {
    render(
      <AdminCertificatesClient educationCertificates={[]} scrimbaCertificates={[]} />
    );
    expect(screen.getByText('Education (0)')).toBeInTheDocument();
    expect(screen.getByText('Scrimba Certificates (0)')).toBeInTheDocument();
  });

  it('uses semantic section elements', () => {
    const { container } = render(
      <AdminCertificatesClient educationCertificates={mockEducationCerts} scrimbaCertificates={mockScrimbaCrets} />
    );
    const sections = container.querySelectorAll('section.admin-section');
    expect(sections).toHaveLength(2);
  });

  it('renders both sections with correct content', () => {
    render(
      <AdminCertificatesClient educationCertificates={mockEducationCerts} scrimbaCertificates={mockScrimbaCrets} />
    );
    expect(screen.getByText('Education (1)')).toBeInTheDocument();
    expect(screen.getByText('Scrimba Certificates (1)')).toBeInTheDocument();
    expect(screen.getByText('Bachelor of Science')).toBeInTheDocument();
    expect(screen.getByText('Advanced React')).toBeInTheDocument();
  });
});
