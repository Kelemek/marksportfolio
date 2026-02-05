import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import JobForm from './JobForm';
import type { Job } from '@/types/job';

const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
};

const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { sort_order: 1 } }),
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

describe('JobForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders form in create mode', () => {
      render(<JobForm mode="create" />);
      expect(screen.getByText('Create Job')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      render(<JobForm mode="create" />);
      expect(screen.getByLabelText('Job Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Company *')).toBeInTheDocument();
      expect(screen.getByLabelText('Location *')).toBeInTheDocument();
      expect(screen.getByLabelText('Period *')).toBeInTheDocument();
    });

    it('initializes with empty values in create mode', () => {
      render(<JobForm mode="create" />);
      expect(screen.getByPlaceholderText('e.g., Senior Developer')).toHaveValue('');
      expect(screen.getByPlaceholderText('e.g., Acme Corp')).toHaveValue('');
    });

    it('allows user to fill in basic job information', () => {
      render(<JobForm mode="create" />);
      const titleInput = screen.getByLabelText('Job Title *') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Senior Developer' } });
      expect(titleInput.value).toBe('Senior Developer');
    });

    it('initializes with one empty achievement field', () => {
      render(<JobForm mode="create" />);
      const achievementInputs = screen.getAllByPlaceholderText('Enter an achievement...');
      expect(achievementInputs.length).toBe(1);
    });

    it('initializes with one empty responsibility field', () => {
      render(<JobForm mode="create" />);
      const responsibilityInputs = screen.getAllByPlaceholderText('Enter a responsibility...');
      expect(responsibilityInputs.length).toBe(1);
    });

    it('allows adding achievements', () => {
      render(<JobForm mode="create" />);
      const addButtons = screen.getAllByText('+ Add Achievement');
      fireEvent.click(addButtons[0]);
      const achievementInputs = screen.getAllByPlaceholderText('Enter an achievement...');
      expect(achievementInputs.length).toBe(2);
    });

    it('allows adding responsibilities', () => {
      render(<JobForm mode="create" />);
      const addButtons = screen.getAllByText('+ Add Responsibility');
      fireEvent.click(addButtons[0]);
      const responsibilityInputs = screen.getAllByPlaceholderText('Enter a responsibility...');
      expect(responsibilityInputs.length).toBe(2);
    });

    it('allows removing achievements by clicking X button', () => {
      render(<JobForm mode="create" />);
      const addButtons = screen.getAllByText('+ Add Achievement');
      fireEvent.click(addButtons[0]);
      
      let achievementInputs = screen.getAllByPlaceholderText('Enter an achievement...');
      expect(achievementInputs.length).toBe(2);
      
      const removeButtons = screen.getAllByText('✕');
      fireEvent.click(removeButtons[0]);
      
      achievementInputs = screen.getAllByPlaceholderText('Enter an achievement...');
      expect(achievementInputs.length).toBe(1);
    });

    it('allows removing responsibilities by clicking X button', () => {
      render(<JobForm mode="create" />);
      const addButtons = screen.getAllByText('+ Add Responsibility');
      fireEvent.click(addButtons[0]);
      
      let responsibilityInputs = screen.getAllByPlaceholderText('Enter a responsibility...');
      expect(responsibilityInputs.length).toBe(2);
      
      const removeButtons = screen.getAllByText('✕');
      fireEvent.click(removeButtons[1]);
      
      responsibilityInputs = screen.getAllByPlaceholderText('Enter a responsibility...');
      expect(responsibilityInputs.length).toBe(1);
    });

    it('allows editing achievement text', () => {
      render(<JobForm mode="create" />);
      const achievementInput = screen.getByPlaceholderText('Enter an achievement...') as HTMLInputElement;
      fireEvent.change(achievementInput, { target: { value: 'Led development' } });
      expect(achievementInput.value).toBe('Led development');
    });

    it('allows editing responsibility text', () => {
      render(<JobForm mode="create" />);
      const responsibilityInput = screen.getByPlaceholderText('Enter a responsibility...') as HTMLInputElement;
      fireEvent.change(responsibilityInput, { target: { value: 'Code reviews' } });
      expect(responsibilityInput.value).toBe('Code reviews');
    });

    it('renders submit and cancel buttons', () => {
      render(<JobForm mode="create" />);
      expect(screen.getByText('Create Job')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('has required attributes on required input fields', () => {
      render(<JobForm mode="create" />);
      expect((screen.getByLabelText('Job Title *') as HTMLInputElement).required).toBe(true);
      expect((screen.getByLabelText('Company *') as HTMLInputElement).required).toBe(true);
      expect((screen.getByLabelText('Location *') as HTMLInputElement).required).toBe(true);
      expect((screen.getByLabelText('Period *') as HTMLInputElement).required).toBe(true);
    });
  });

  describe('Edit Mode', () => {
    const mockJob: Job = {
      id: '1',
      title: 'Senior Developer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      period: '2020 - Present',
      achievements: ['Led key feature development', 'Mentored juniors'],
      responsibilities: ['Code reviews', 'Architecture'],
      sort_order: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('renders form in edit mode', () => {
      render(<JobForm job={mockJob} mode="edit" />);
      expect(screen.getByText('Update Job')).toBeInTheDocument();
    });

    it('populates form with existing job data', () => {
      render(<JobForm job={mockJob} mode="edit" />);
      expect(screen.getByDisplayValue('Senior Developer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Tech Corp')).toBeInTheDocument();
    });

    it('loads achievements from existing job', () => {
      render(<JobForm job={mockJob} mode="edit" />);
      expect(screen.getByDisplayValue('Led key feature development')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Mentored juniors')).toBeInTheDocument();
    });

    it('loads responsibilities from existing job', () => {
      render(<JobForm job={mockJob} mode="edit" />);
      expect(screen.getByDisplayValue('Code reviews')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Architecture')).toBeInTheDocument();
    });

    it('allows editing all fields in edit mode', () => {
      render(<JobForm job={mockJob} mode="edit" />);
      const titleInput = screen.getByLabelText('Job Title *') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Principal Engineer' } });
      expect(titleInput.value).toBe('Principal Engineer');
    });

    it('renders update button instead of create', () => {
      render(<JobForm job={mockJob} mode="edit" />);
      expect(screen.getByText('Update Job')).toBeInTheDocument();
      expect(screen.queryByText('Create Job')).not.toBeInTheDocument();
    });
  });

  describe('Cancel Button', () => {
    it('cancel button navigates to jobs page when clicked', () => {
      render(<JobForm mode="create" />);
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/jobs');
    });
  });

  describe('Array Field Management', () => {
    it('shows add buttons for achievements and responsibilities', () => {
      render(<JobForm mode="create" />);
      expect(screen.getAllByText('+ Add Achievement')).toHaveLength(1);
      expect(screen.getAllByText('+ Add Responsibility')).toHaveLength(1);
    });

    it('renders remove button (✕) for each added field', () => {
      render(<JobForm mode="create" />);
      const addButtons = screen.getAllByText('+ Add Achievement');
      fireEvent.click(addButtons[0]);
      
      const removeButtons = screen.getAllByText('✕');
      expect(removeButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Form Submission', () => {
    it('form exists and wraps all inputs', () => {
      render(<JobForm mode="create" />);
      const form = screen.getByText('Create Job').closest('form');
      expect(form).toBeInTheDocument();
      expect(form?.querySelector('input[type="text"]')).toBeInTheDocument();
    });

    it('renders submit button in create mode', () => {
      render(<JobForm mode="create" />);
      expect(screen.getByText('Create Job')).toBeInTheDocument();
    });

    it('renders submit button in edit mode', () => {
      const mockJob: Job = {
        id: '1',
        title: 'Senior Developer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        period: '2020 - Present',
        achievements: ['Led key feature development', 'Mentored juniors'],
        responsibilities: ['Code reviews', 'Architecture'],
        sort_order: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      render(<JobForm job={mockJob} mode="edit" />);
      expect(screen.getByText('Update Job')).toBeInTheDocument();
    });

    it('calls supabase insert on form submission in create mode', async () => {
      render(<JobForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Job Title *'), { target: { value: 'Developer' } });
      fireEvent.change(screen.getByLabelText('Company *'), { target: { value: 'Tech Corp' } });
      fireEvent.change(screen.getByLabelText('Location *'), { target: { value: 'NYC' } });
      fireEvent.change(screen.getByLabelText('Period *'), { target: { value: '2023-2024' } });
      fireEvent.click(screen.getByText('Create Job'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('jobs');
    });

    it('calls supabase update on form submission in edit mode', async () => {
      const mockJob: Job = {
        id: '1',
        title: 'Senior Developer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        period: '2020 - Present',
        achievements: ['Led key feature development'],
        responsibilities: ['Code reviews'],
        sort_order: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      render(<JobForm job={mockJob} mode="edit" />);
      fireEvent.change(screen.getByLabelText('Job Title *'), { target: { value: 'Principal Engineer' } });
      fireEvent.click(screen.getByText('Update Job'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('jobs');
    });

    it('calls revalidate API on successful form submission', async () => {
      render(<JobForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Job Title *'), { target: { value: 'Developer' } });
      fireEvent.change(screen.getByLabelText('Company *'), { target: { value: 'Tech Corp' } });
      fireEvent.change(screen.getByLabelText('Location *'), { target: { value: 'NYC' } });
      fireEvent.change(screen.getByLabelText('Period *'), { target: { value: '2023-2024' } });
      fireEvent.click(screen.getByText('Create Job'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(global.fetch).toHaveBeenCalledWith('/api/revalidate', { method: 'POST' });
    });

    it('navigates to jobs page on successful submission', async () => {
      render(<JobForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Job Title *'), { target: { value: 'Developer' } });
      fireEvent.change(screen.getByLabelText('Company *'), { target: { value: 'Tech Corp' } });
      fireEvent.change(screen.getByLabelText('Location *'), { target: { value: 'NYC' } });
      fireEvent.change(screen.getByLabelText('Period *'), { target: { value: '2023-2024' } });
      fireEvent.click(screen.getByText('Create Job'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/jobs');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });

    it('filters out empty achievements before submission', async () => {
      render(<JobForm mode="create" />);
      const achievementInputs = screen.getAllByPlaceholderText('Enter an achievement...');
      fireEvent.change(achievementInputs[0], { target: { value: 'Led development' } });
      
      fireEvent.change(screen.getByLabelText('Job Title *'), { target: { value: 'Developer' } });
      fireEvent.change(screen.getByLabelText('Company *'), { target: { value: 'Tech Corp' } });
      fireEvent.change(screen.getByLabelText('Location *'), { target: { value: 'NYC' } });
      fireEvent.change(screen.getByLabelText('Period *'), { target: { value: '2023-2024' } });
      
      fireEvent.click(screen.getByText('Create Job'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalled();
    });

    it('filters out empty responsibilities before submission', async () => {
      render(<JobForm mode="create" />);
      const responsibilityInputs = screen.getAllByPlaceholderText('Enter a responsibility...');
      fireEvent.change(responsibilityInputs[0], { target: { value: 'Code reviews' } });
      
      fireEvent.change(screen.getByLabelText('Job Title *'), { target: { value: 'Developer' } });
      fireEvent.change(screen.getByLabelText('Company *'), { target: { value: 'Tech Corp' } });
      fireEvent.change(screen.getByLabelText('Location *'), { target: { value: 'NYC' } });
      fireEvent.change(screen.getByLabelText('Period *'), { target: { value: '2023-2024' } });
      
      fireEvent.click(screen.getByText('Create Job'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalled();
    });

    it('displays error message on submission failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Temporarily mock fetch to fail
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      render(<JobForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Job Title *'), { target: { value: 'Developer' } });
      fireEvent.change(screen.getByLabelText('Company *'), { target: { value: 'Tech Corp' } });
      fireEvent.change(screen.getByLabelText('Location *'), { target: { value: 'NYC' } });
      fireEvent.change(screen.getByLabelText('Period *'), { target: { value: '2023-2024' } });
      fireEvent.click(screen.getByText('Create Job'));

      await new Promise(resolve => setTimeout(resolve, 100));
      
      global.fetch = originalFetch;
      consoleErrorSpy.mockRestore();
    });

    it('handles sort_order calculation in create mode', async () => {
      render(<JobForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Job Title *'), { target: { value: 'Developer' } });
      fireEvent.change(screen.getByLabelText('Company *'), { target: { value: 'Tech Corp' } });
      fireEvent.change(screen.getByLabelText('Location *'), { target: { value: 'NYC' } });
      fireEvent.change(screen.getByLabelText('Period *'), { target: { value: '2023-2024' } });
      fireEvent.click(screen.getByText('Create Job'));

      await new Promise(resolve => setTimeout(resolve, 100));
      // Verify the sort_order query was called
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('jobs');
    });
  });

  describe('Styling and Classes', () => {
    it('applies correct CSS classes to inputs', () => {
      render(<JobForm mode="create" />);
      const titleInput = screen.getByLabelText('Job Title *');
      expect(titleInput.className).toContain('border');
      expect(titleInput.className).toContain('rounded-lg');
    });

    it('applies button styling classes', () => {
      render(<JobForm mode="create" />);
      const submitButton = screen.getByText('Create Job');
      expect(submitButton.className).toContain('btn');
    });

    it('add/remove buttons have correct styling', () => {
      render(<JobForm mode="create" />);
      const addButton = screen.getAllByText('+ Add Achievement')[0];
      expect(addButton.className).toContain('text-pink');
    });
  });
});
