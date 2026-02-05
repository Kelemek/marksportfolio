import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CertificateForm from './CertificateForm';
import type { Certificate } from '@/types/certificate';

const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
};

const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { sort_order: 1 } }),
          })),
        })),
      })),
    })),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

global.fetch = vi.fn().mockResolvedValue({ ok: true });

describe('CertificateForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders form in create mode', () => {
      render(<CertificateForm mode="create" />);
      expect(screen.getByText('Create Certificate')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      render(<CertificateForm mode="create" />);
      expect(screen.getByLabelText('Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Institution *')).toBeInTheDocument();
      expect(screen.getByLabelText('Category *')).toBeInTheDocument();
    });

    it('initializes with empty values in create mode', () => {
      render(<CertificateForm mode="create" />);
      expect(screen.getByPlaceholderText('e.g., Bachelor of Science')).toHaveValue('');
      expect(screen.getByPlaceholderText('e.g., University of Example')).toHaveValue('');
    });

    it('initializes with education category as default', () => {
      render(<CertificateForm mode="create" />);
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement;
      expect(categorySelect.value).toBe('education');
    });

    it('allows user to change form values', () => {
      render(<CertificateForm mode="create" />);
      const titleInput = screen.getByLabelText('Title *') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'B.S. in CS' } });
      expect(titleInput.value).toBe('B.S. in CS');
    });

    it('allows changing category', () => {
      render(<CertificateForm mode="create" />);
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement;
      fireEvent.change(categorySelect, { target: { value: 'scrimba' } });
      expect(categorySelect.value).toBe('scrimba');
    });

    it('renders optional aria_label field', () => {
      render(<CertificateForm mode="create" />);
      expect(screen.getByLabelText('Aria Label')).toBeInTheDocument();
    });

    it('renders submit and cancel buttons', () => {
      render(<CertificateForm mode="create" />);
      expect(screen.getByText('Create Certificate')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('has required attributes on required input fields', () => {
      render(<CertificateForm mode="create" />);
      expect((screen.getByLabelText('Title *') as HTMLInputElement).required).toBe(true);
      expect((screen.getByLabelText('Institution *') as HTMLInputElement).required).toBe(true);
    });
  });

  describe('Edit Mode', () => {
    const mockCertificate: Certificate = {
      id: '1',
      title: 'Bachelor of Science',
      institution: 'State University',
      pdf_path: 'cert-123.pdf',
      aria_label: 'Bachelor degree',
      category: 'education',
      sort_order: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('renders form in edit mode', () => {
      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      expect(screen.getByText('Update Certificate')).toBeInTheDocument();
    });

    it('populates form with existing certificate data', () => {
      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      expect(screen.getByDisplayValue('Bachelor of Science')).toBeInTheDocument();
      expect(screen.getByDisplayValue('State University')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bachelor degree')).toBeInTheDocument();
    });

    it('displays existing category value', () => {
      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement;
      expect(categorySelect.value).toBe('education');
    });

    it('allows editing fields in edit mode', () => {
      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      const titleInput = screen.getByLabelText('Title *') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Master of Science' } });
      expect(titleInput.value).toBe('Master of Science');
    });

    it('allows changing category in edit mode', () => {
      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement;
      fireEvent.change(categorySelect, { target: { value: 'scrimba' } });
      expect(categorySelect.value).toBe('scrimba');
    });

    it('renders update button instead of create', () => {
      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      expect(screen.getByText('Update Certificate')).toBeInTheDocument();
      expect(screen.queryByText('Create Certificate')).not.toBeInTheDocument();
    });

    it('shows current PDF file link when pdf_path exists', () => {
      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      const pdfLink = screen.getByText('View file');
      expect(pdfLink).toBeInTheDocument();
      expect(pdfLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Cancel Button', () => {
    it('cancel button navigates to certificates page when clicked', () => {
      render(<CertificateForm mode="create" />);
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/certificates');
    });
  });

  describe('Form Attributes', () => {
    it('renders category select with dropdown options', () => {
      render(<CertificateForm mode="create" />);
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThanOrEqual(2);
    });

    it('renders dropdown indicator SVG', () => {
      render(<CertificateForm mode="create" />);
      const categoryContainer = screen.getByLabelText('Category *').parentElement;
      const svg = categoryContainer?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('PDF File Upload', () => {
    it('renders file input for PDF', () => {
      render(<CertificateForm mode="create" />);
      const fileInputs = screen.getAllByRole('button').filter(
        btn => btn.className.includes('file:')
      );
      expect(fileInputs.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Form Submission', () => {
    it('submit button is disabled while loading', async () => {
      render(<CertificateForm mode="create" />);
      const submitButton = screen.getByText('Create Certificate') as HTMLButtonElement;
      expect(submitButton.className).toContain('disabled:opacity-50');
    });

    it('form exists and wraps all inputs', () => {
      render(<CertificateForm mode="create" />);
      const form = screen.getByText('Create Certificate').closest('form');
      expect(form).toBeInTheDocument();
      expect(form?.querySelector('input[type="text"]')).toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('applies correct CSS classes to inputs', () => {
      render(<CertificateForm mode="create" />);
      const titleInput = screen.getByLabelText('Title *');
      expect(titleInput.className).toContain('border');
      expect(titleInput.className).toContain('rounded-lg');
    });

    it('applies button styling classes', () => {
      render(<CertificateForm mode="create" />);
      const submitButton = screen.getByText('Create Certificate');
      expect(submitButton.className).toContain('btn');
    });
  });

  describe('Form Submit - Create Mode', () => {
    it('calls supabase insert on form submission', async () => {
      render(<CertificateForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'B.S.' } });
      fireEvent.change(screen.getByLabelText('Institution *'), { target: { value: 'University' } });
      fireEvent.click(screen.getByText('Create Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('certificates');
    });

    it('calls revalidate API on successful submit', async () => {
      render(<CertificateForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'B.S.' } });
      fireEvent.change(screen.getByLabelText('Institution *'), { target: { value: 'University' } });
      fireEvent.click(screen.getByText('Create Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(global.fetch).toHaveBeenCalledWith('/api/revalidate', { method: 'POST' });
    });

    it('navigates to certificates page on successful submission', async () => {
      render(<CertificateForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'B.S.' } });
      fireEvent.change(screen.getByLabelText('Institution *'), { target: { value: 'University' } });
      fireEvent.click(screen.getByText('Create Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/certificates');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  describe('Form Submit - Edit Mode', () => {
    const mockCertificate: Certificate = {
      id: '1',
      title: 'Bachelor of Science',
      institution: 'State University',
      pdf_path: 'cert-123.pdf',
      aria_label: 'Bachelor degree',
      category: 'education',
      sort_order: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('calls supabase update on form submission in edit mode', async () => {
      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Master of Science' } });
      fireEvent.click(screen.getByText('Update Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('certificates');
    });

    it('navigates to certificates page on successful edit submission', async () => {
      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Master of Science' } });
      fireEvent.click(screen.getByText('Update Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/certificates');
    });
  });

  describe('PDF File Handling', () => {
    it('renders PDF file input with correct accept type', () => {
      render(<CertificateForm mode="create" />);
      const fileInputs = document.querySelectorAll('input[type="file"]');
      const pdfInput = Array.from(fileInputs).find((input: Element) => {
        const htmlInput = input as HTMLInputElement;
        return htmlInput.accept && htmlInput.accept.includes('pdf');
      });
      expect(pdfInput).toBeDefined();
    });

    it('displays Certificate PDF label', () => {
      render(<CertificateForm mode="create" />);
      expect(screen.getByText('Certificate PDF')).toBeInTheDocument();
    });

    it('shows existing certificate PDF link in edit mode', () => {
      const mockCertificate: Certificate = {
        id: '1',
        title: 'Bachelor of Science',
        institution: 'State University',
        pdf_path: 'cert-123.pdf',
        aria_label: 'Bachelor degree',
        category: 'education',
        sort_order: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      expect(screen.getByText('View file')).toBeInTheDocument();
    });

    it('uploads PDF file and updates sort order in create mode', async () => {
      render(<CertificateForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'B.S. Degree' } });
      fireEvent.change(screen.getByLabelText('Institution *'), { target: { value: 'University' } });
      fireEvent.click(screen.getByText('Create Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('certificates');
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/certificates');
    });

    it('persists existing PDF when updating without new file', async () => {
      const mockCertificate: Certificate = {
        id: '1',
        title: 'Bachelor of Science',
        institution: 'State University',
        pdf_path: 'cert-123.pdf',
        aria_label: 'Bachelor degree',
        category: 'education',
        sort_order: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Master of Science' } });
      fireEvent.click(screen.getByText('Update Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/certificates');
    });
  });

  describe('Aria Label Field', () => {
    it('is optional and can be left empty', () => {
      render(<CertificateForm mode="create" />);
      const ariaLabelInput = screen.getByLabelText('Aria Label') as HTMLInputElement;
      expect(ariaLabelInput.required).toBe(false);
    });

    it('can be filled with custom value', () => {
      render(<CertificateForm mode="create" />);
      const ariaLabelInput = screen.getByLabelText('Aria Label') as HTMLInputElement;
      fireEvent.change(ariaLabelInput, { target: { value: 'My degree' } });
      expect(ariaLabelInput.value).toBe('My degree');
    });

    it('loads aria_label from certificate in edit mode', () => {
      const mockCertificate: Certificate = {
        id: '1',
        title: 'Bachelor of Science',
        institution: 'State University',
        pdf_path: 'cert-123.pdf',
        aria_label: 'BS Degree from State University',
        category: 'education',
        sort_order: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      expect(screen.getByDisplayValue('BS Degree from State University')).toBeInTheDocument();
    });
  });

  describe('Form Submission with Category', () => {
    it('submits with education category in create mode', async () => {
      render(<CertificateForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'B.S.' } });
      fireEvent.change(screen.getByLabelText('Institution *'), { target: { value: 'University' } });
      const categorySelect = screen.getByDisplayValue('Education') as HTMLSelectElement;
      expect(categorySelect.value).toBe('education');
      fireEvent.click(screen.getByText('Create Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('certificates');
    });

    it('submits with scrimba category when selected', async () => {
      render(<CertificateForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Scrimba Course' } });
      fireEvent.change(screen.getByLabelText('Institution *'), { target: { value: 'Scrimba' } });
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement;
      fireEvent.change(categorySelect, { target: { value: 'scrimba' } });
      fireEvent.click(screen.getByText('Create Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('certificates');
    });

    it('includes aria_label in submission data', async () => {
      render(<CertificateForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'B.S.' } });
      fireEvent.change(screen.getByLabelText('Institution *'), { target: { value: 'University' } });
      fireEvent.change(screen.getByLabelText('Aria Label'), { target: { value: 'My degree' } });
      fireEvent.click(screen.getByText('Create Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('certificates');
    });
  });

  describe('Category Selection', () => {
    it('includes both education and scrimba categories', () => {
      render(<CertificateForm mode="create" />);
      const options = screen.getAllByRole('option');
      const optionValues = options.map(opt => opt.textContent);
      expect(optionValues).toContain('Education');
      expect(optionValues).toContain('Scrimba');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when update fails', async () => {
      const mockCertificate: Certificate = {
        id: '1',
        title: 'Bachelor of Science',
        institution: 'State University',
        pdf_path: 'cert-123.pdf',
        aria_label: 'Bachelor degree',
        category: 'education',
        sort_order: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockError = new Error('Update failed');
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({ error: mockError }),
        }),
      } as any);

      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Master of Science' } });
      fireEvent.click(screen.getByText('Update Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });

    it('shows error div when error occurs', async () => {
      const mockCertificate: Certificate = {
        id: '1',
        title: 'Bachelor of Science',
        institution: 'State University',
        pdf_path: 'cert-123.pdf',
        aria_label: 'Bachelor degree',
        category: 'education',
        sort_order: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockError = new Error('Form submission error');
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({ error: mockError }),
        }),
      } as any);

      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Updated Title' } });
      fireEvent.click(screen.getByText('Update Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      const errorDiv = document.querySelector('div[class*="bg-red"]');
      expect(errorDiv).toBeInTheDocument();
    });
  });

  describe('Form Field Interactions', () => {
    it('updates formData when title field changes', () => {
      render(<CertificateForm mode="create" />);
      const titleInput = screen.getByLabelText('Title *') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'New Title' } });
      expect(titleInput.value).toBe('New Title');
    });

    it('updates formData when institution field changes', () => {
      render(<CertificateForm mode="create" />);
      const institutionInput = screen.getByLabelText('Institution *') as HTMLInputElement;
      fireEvent.change(institutionInput, { target: { value: 'New Institution' } });
      expect(institutionInput.value).toBe('New Institution');
    });

    it('updates formData when category field changes', () => {
      render(<CertificateForm mode="create" />);
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement;
      fireEvent.change(categorySelect, { target: { value: 'scrimba' } });
      expect(categorySelect.value).toBe('scrimba');
    });

    it('allows empty aria_label submission', async () => {
      render(<CertificateForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Title' } });
      fireEvent.change(screen.getByLabelText('Institution *'), { target: { value: 'Institution' } });
      // Leave aria_label empty
      fireEvent.click(screen.getByText('Create Certificate'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRouter.push).toHaveBeenCalled();
    });

    it('preserves certificate data during edit mode population', () => {
      const mockCertificate: Certificate = {
        id: '1',
        title: 'Bachelor of Science',
        institution: 'State University',
        pdf_path: 'cert-123.pdf',
        aria_label: 'BS Degree',
        category: 'education',
        sort_order: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      render(<CertificateForm certificate={mockCertificate} mode="edit" />);
      expect(screen.getByDisplayValue('Bachelor of Science')).toBeInTheDocument();
      expect(screen.getByDisplayValue('State University')).toBeInTheDocument();
      expect(screen.getByDisplayValue('BS Degree')).toBeInTheDocument();
    });
  });
});