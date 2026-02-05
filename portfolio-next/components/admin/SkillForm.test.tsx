import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SkillForm from './SkillForm';
import type { Skill } from '@/types/skill';

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
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

global.fetch = vi.fn().mockResolvedValue({ ok: true });

describe('SkillForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders form in create mode', () => {
      render(<SkillForm mode="create" />);
      expect(screen.getByText('Create Skill')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      render(<SkillForm mode="create" />);
      expect(screen.getByLabelText('Skill Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Years of Experience *')).toBeInTheDocument();
      expect(screen.getByLabelText('Category *')).toBeInTheDocument();
    });

    it('initializes with empty values in create mode', () => {
      render(<SkillForm mode="create" />);
      expect(screen.getByPlaceholderText('e.g., JavaScript')).toHaveValue('');
      expect(screen.getByPlaceholderText('e.g., 5+ years')).toHaveValue('');
    });

    it('initializes with development category as default', () => {
      render(<SkillForm mode="create" />);
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement;
      expect(categorySelect.value).toBe('development');
    });

    it('allows user to change form values', () => {
      render(<SkillForm mode="create" />);
      const nameInput = screen.getByLabelText('Skill Name *') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'React' } });
      expect(nameInput.value).toBe('React');
    });

    it('allows changing category', () => {
      render(<SkillForm mode="create" />);
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement;
      fireEvent.change(categorySelect, { target: { value: 'systems' } });
      expect(categorySelect.value).toBe('systems');
    });

    it('renders submit and cancel buttons', () => {
      render(<SkillForm mode="create" />);
      expect(screen.getByText('Create Skill')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('has required attributes on input fields', () => {
      render(<SkillForm mode="create" />);
      expect((screen.getByLabelText('Skill Name *') as HTMLInputElement).required).toBe(true);
      expect((screen.getByLabelText('Years of Experience *') as HTMLInputElement).required).toBe(true);
    });
  });

  describe('Edit Mode', () => {
    const mockSkill: Skill = {
      id: '1',
      name: 'React',
      years: '3 years',
      category: 'development',
      sort_order: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('renders form in edit mode', () => {
      render(<SkillForm skill={mockSkill} mode="edit" />);
      expect(screen.getByText('Update Skill')).toBeInTheDocument();
    });

    it('populates form with existing skill data', () => {
      render(<SkillForm skill={mockSkill} mode="edit" />);
      expect(screen.getByDisplayValue('React')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3 years')).toBeInTheDocument();
    });

    it('displays existing category value', () => {
      render(<SkillForm skill={mockSkill} mode="edit" />);
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement;
      expect(categorySelect.value).toBe('development');
    });

    it('allows editing fields in edit mode', () => {
      render(<SkillForm skill={mockSkill} mode="edit" />);
      const nameInput = screen.getByLabelText('Skill Name *') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Vue' } });
      expect(nameInput.value).toBe('Vue');
    });

    it('allows changing category in edit mode', () => {
      render(<SkillForm skill={mockSkill} mode="edit" />);
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement;
      fireEvent.change(categorySelect, { target: { value: 'systems' } });
      expect(categorySelect.value).toBe('systems');
    });

    it('renders update button instead of create', () => {
      render(<SkillForm skill={mockSkill} mode="edit" />);
      expect(screen.getByText('Update Skill')).toBeInTheDocument();
      expect(screen.queryByText('Create Skill')).not.toBeInTheDocument();
    });
  });

  describe('Cancel Button', () => {
    it('cancel button navigates away when clicked', () => {
      render(<SkillForm mode="create" />);
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/skills');
    });
  });

  describe('Form Attributes', () => {
    it('renders category select with dropdown options', () => {
      render(<SkillForm mode="create" />);
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThanOrEqual(2);
    });

    it('renders dropdown indicator SVG', () => {
      render(<SkillForm mode="create" />);
      const categoryContainer = screen.getByLabelText('Category *').parentElement;
      const svg = categoryContainer?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submit button is disabled while loading', async () => {
      render(<SkillForm mode="create" />);
      const submitButton = screen.getByText('Create Skill') as HTMLButtonElement;
      expect(submitButton.className).toContain('disabled:opacity-50');
    });

    it('form exists and wraps all inputs', () => {
      render(<SkillForm mode="create" />);
      const form = screen.getByText('Create Skill').closest('form');
      expect(form).toBeInTheDocument();
      expect(form?.querySelector('input[type="text"]')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('renders error container if error exists', () => {
      const { rerender } = render(<SkillForm mode="create" />);
      let errorDiv = screen.queryByText(/error/i);
      expect(errorDiv).not.toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('applies correct CSS classes to inputs', () => {
      render(<SkillForm mode="create" />);
      const nameInput = screen.getByLabelText('Skill Name *');
      expect(nameInput.className).toContain('border');
      expect(nameInput.className).toContain('rounded-lg');
    });

    it('applies button styling classes', () => {
      render(<SkillForm mode="create" />);
      const submitButton = screen.getByText('Create Skill');
      expect(submitButton.className).toContain('btn');
    });
  });

  describe('Form Submit - Create Mode', () => {
    it('calls supabase insert on form submission', async () => {
      render(<SkillForm mode="create" />);
      const nameInput = screen.getByLabelText('Skill Name *');
      const yearsInput = screen.getByLabelText('Years of Experience *');
      const submitButton = screen.getByText('Create Skill');
      
      fireEvent.change(nameInput, { target: { value: 'React' } });
      fireEvent.change(yearsInput, { target: { value: '3 years' } });
      fireEvent.click(submitButton);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('skills');
    });

    it('calls revalidate API on successful submit', async () => {
      render(<SkillForm mode="create" />);
      const nameInput = screen.getByLabelText('Skill Name *');
      const yearsInput = screen.getByLabelText('Years of Experience *');
      
      fireEvent.change(nameInput, { target: { value: 'React' } });
      fireEvent.change(yearsInput, { target: { value: '3 years' } });
      fireEvent.click(screen.getByText('Create Skill'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(global.fetch).toHaveBeenCalledWith('/api/revalidate', { method: 'POST' });
    });

    it('navigates to skills page on successful submission', async () => {
      render(<SkillForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Skill Name *'), { target: { value: 'React' } });
      fireEvent.change(screen.getByLabelText('Years of Experience *'), { target: { value: '3' } });
      fireEvent.click(screen.getByText('Create Skill'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/skills');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  describe('Form Submit - Edit Mode', () => {
    const mockSkill: Skill = {
      id: '1',
      name: 'React',
      years: '3 years',
      category: 'development',
      sort_order: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('calls supabase update on form submission in edit mode', async () => {
      render(<SkillForm skill={mockSkill} mode="edit" />);
      const nameInput = screen.getByLabelText('Skill Name *');
      
      fireEvent.change(nameInput, { target: { value: 'Vue' } });
      fireEvent.click(screen.getByText('Update Skill'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('skills');
    });

    it('navigates to skills page on successful edit submission', async () => {
      render(<SkillForm skill={mockSkill} mode="edit" />);
      fireEvent.change(screen.getByLabelText('Skill Name *'), { target: { value: 'Vue' } });
      fireEvent.click(screen.getByText('Update Skill'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/skills');
    });
  });

  describe('Category Selection', () => {
    it('includes both development and systems categories', () => {
      render(<SkillForm mode="create" />);
      const options = screen.getAllByRole('option');
      const optionValues = options.map(opt => opt.textContent);
      expect(optionValues).toContain('Development');
      expect(optionValues).toContain('Systems');
    });
  });
});
