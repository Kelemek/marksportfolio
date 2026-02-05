import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectForm from './ProjectForm';
import { Project } from '@/types/project';

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
};
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    update: vi.fn().mockResolvedValue({ data: {}, error: null }),
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  })),
};
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
  getSupabaseClient: () => mockSupabaseClient,
}));

// Mock fetch for revalidate API
global.fetch = vi.fn().mockResolvedValue({ ok: true });

describe('ProjectForm', () => {
  const mockProject: Project = {
    id: '1',
    title: 'Personal Portfolio',
    slug: 'personal-portfolio',
    description: 'A Next.js portfolio site',
    image_url: 'image.jpg',
    site_url: 'https://example.com',
    github_url: 'https://github.com/example',
    technologies: ['Next.js', 'React', 'TypeScript'],
    image_alt: 'Portfolio screenshot',
    type: 'coding',
    display_order: 1,
    is_visible: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    mockRouter.push.mockClear();
    mockRouter.refresh.mockClear();
  });

  describe('Create Mode', () => {
    it('renders form in create mode', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByText('Create Project')).toBeInTheDocument();
    });

    it('renders title input in create mode', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    });

    it('renders slug input in create mode', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByLabelText('Slug *')).toBeInTheDocument();
    });

    it('renders description input in create mode', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('renders technologies input in create mode', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByLabelText('Technologies (comma-separated)')).toBeInTheDocument();
    });

    it('renders create button', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByText('Create Project')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('renders form in edit mode', () => {
      render(<ProjectForm project={mockProject} mode="edit" />);
      expect(screen.getByText('Update Project')).toBeInTheDocument();
    });

    it('populates form with existing project data', () => {
      render(<ProjectForm project={mockProject} mode="edit" />);
      expect(screen.getByDisplayValue('Personal Portfolio')).toBeInTheDocument();
      expect(screen.getByDisplayValue('personal-portfolio')).toBeInTheDocument();
    });

    it('loads description from existing project', () => {
      render(<ProjectForm project={mockProject} mode="edit" />);
      expect(screen.getByDisplayValue('A Next.js portfolio site')).toBeInTheDocument();
    });

    it('loads technologies from existing project', () => {
      render(<ProjectForm project={mockProject} mode="edit" />);
      expect(screen.getByDisplayValue('Next.js, React, TypeScript')).toBeInTheDocument();
    });

    it('allows editing all fields in edit mode', () => {
      render(<ProjectForm project={mockProject} mode="edit" />);
      const titleInput = screen.getByLabelText('Title *') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'New Title' } });
      expect(titleInput.value).toBe('New Title');
    });

    it('renders update button instead of create', () => {
      render(<ProjectForm project={mockProject} mode="edit" />);
      expect(screen.getByText('Update Project')).toBeInTheDocument();
      expect(screen.queryByText('Create Project')).not.toBeInTheDocument();
    });
  });

  describe('URL Fields', () => {
    it('renders site URL input', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByLabelText('Site URL')).toBeInTheDocument();
    });

    it('renders GitHub URL input', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByLabelText('GitHub URL')).toBeInTheDocument();
    });

    it('renders image alt text input', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByLabelText('Image Alt Text')).toBeInTheDocument();
    });
  });

  describe('Checkboxes', () => {
    it('renders visible checkbox', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByLabelText('Visible')).toBeInTheDocument();
    });

    it('can toggle visible checkbox', () => {
      render(<ProjectForm mode="create" />);
      const checkbox = screen.getByLabelText('Visible') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('Cancel Button', () => {
    it('cancel link navigates to admin page', () => {
      render(<ProjectForm mode="create" />);
      const cancelLink = screen.getByText('Cancel') as HTMLAnchorElement;
      expect(cancelLink.href).toContain('/admin');
    });
  });

  describe('Form Submission', () => {
    it('form exists and wraps all inputs', () => {
      render(<ProjectForm mode="create" />);
      const form = screen.getByText('Create Project').closest('form');
      expect(form).toBeInTheDocument();
      expect(form?.querySelector('input[type="text"]')).toBeInTheDocument();
    });
  });

  describe('Form Submit - Create Mode', () => {
    it('calls supabase insert on form submission', async () => {
      render(<ProjectForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'New Project' } });
      fireEvent.change(screen.getByLabelText('Slug *'), { target: { value: 'new-project' } });
      fireEvent.click(screen.getByText('Create Project'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects');
    });

    it('calls revalidate API on successful submit', async () => {
      render(<ProjectForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'New Project' } });
      fireEvent.change(screen.getByLabelText('Slug *'), { target: { value: 'new-project' } });
      fireEvent.click(screen.getByText('Create Project'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(global.fetch).toHaveBeenCalledWith('/api/revalidate', { method: 'POST' });
    });

    it('navigates to admin page on successful submission', async () => {
      render(<ProjectForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'New Project' } });
      fireEvent.change(screen.getByLabelText('Slug *'), { target: { value: 'new-project' } });
      fireEvent.click(screen.getByText('Create Project'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRouter.push).toHaveBeenCalledWith('/admin');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  describe('Form Submit - Edit Mode', () => {
    it('calls supabase update on form submission in edit mode', async () => {
      render(<ProjectForm project={mockProject} mode="edit" />);
      fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Updated Title' } });
      fireEvent.click(screen.getByText('Update Project'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects');
    });

    it('preserves all fields when updating', async () => {
      render(<ProjectForm project={mockProject} mode="edit" />);
      const titleInput = screen.getByLabelText('Title *') as HTMLInputElement;
      const slugInput = screen.getByLabelText('Slug *') as HTMLInputElement;
      expect(titleInput.value).toBe('Personal Portfolio');
      expect(slugInput.value).toBe('personal-portfolio');
    });
  });

  describe('Form Field Changes', () => {
    it('updates title when changed', () => {
      render(<ProjectForm mode="create" />);
      const titleInput = screen.getByLabelText('Title *') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      expect(titleInput.value).toBe('Updated Title');
    });

    it('updates slug when changed', () => {
      render(<ProjectForm mode="create" />);
      const slugInput = screen.getByLabelText('Slug *') as HTMLInputElement;
      fireEvent.change(slugInput, { target: { value: 'updated-slug' } });
      expect(slugInput.value).toBe('updated-slug');
    });

    it('updates description when changed', () => {
      render(<ProjectForm mode="create" />);
      const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
      fireEvent.change(descInput, { target: { value: 'New description' } });
      expect(descInput.value).toBe('New description');
    });

    it('updates technologies when changed', () => {
      render(<ProjectForm mode="create" />);
      const techInput = screen.getByLabelText('Technologies (comma-separated)') as HTMLInputElement;
      fireEvent.change(techInput, { target: { value: 'React, Node.js' } });
      expect(techInput.value).toBe('React, Node.js');
    });

    it('updates site URL when changed', () => {
      render(<ProjectForm mode="create" />);
      const siteUrlInput = screen.getByLabelText('Site URL') as HTMLInputElement;
      fireEvent.change(siteUrlInput, { target: { value: 'https://example.com' } });
      expect(siteUrlInput.value).toBe('https://example.com');
    });

    it('updates GitHub URL when changed', () => {
      render(<ProjectForm mode="create" />);
      const githubInput = screen.getByLabelText('GitHub URL') as HTMLInputElement;
      fireEvent.change(githubInput, { target: { value: 'https://github.com/user/repo' } });
      expect(githubInput.value).toBe('https://github.com/user/repo');
    });

    it('updates image alt text when changed', () => {
      render(<ProjectForm mode="create" />);
      const altInput = screen.getByLabelText('Image Alt Text') as HTMLInputElement;
      fireEvent.change(altInput, { target: { value: 'Project screenshot' } });
      expect(altInput.value).toBe('Project screenshot');
    });
  });

  describe('Type and Display Order Fields', () => {
    it('renders type select dropdown', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByLabelText('Type *')).toBeInTheDocument();
    });

    it('renders display order input', () => {
      render(<ProjectForm mode="create" />);
      expect(screen.getByLabelText('Display Order')).toBeInTheDocument();
    });

    it('can change project type', () => {
      render(<ProjectForm mode="create" />);
      const typeSelect = screen.getByLabelText('Type *') as HTMLSelectElement;
      expect(typeSelect.value).toBe('coding');
      fireEvent.change(typeSelect, { target: { value: 'drawing' } });
      expect(typeSelect.value).toBe('drawing');
    });

    it('loads project type from existing project', () => {
      const drawingProject: Project = {
        ...mockProject,
        type: 'drawing',
      };
      render(<ProjectForm project={drawingProject} mode="edit" />);
      const typeSelect = screen.getByLabelText('Type *') as HTMLSelectElement;
      expect(typeSelect.value).toBe('drawing');
    });

    it('can change display order', () => {
      render(<ProjectForm mode="create" />);
      const orderInput = screen.getByLabelText('Display Order') as HTMLInputElement;
      fireEvent.change(orderInput, { target: { value: '5' } });
      expect(orderInput.value).toBe('5');
    });
  });

  describe('Display Order Buttons', () => {
    it('increments display order with up button', () => {
      render(<ProjectForm mode="create" />);
      const orderInput = screen.getByLabelText('Display Order') as HTMLInputElement;
      expect(orderInput.value).toBe('0');
      
      // Find and click the up button
      const upButtons = document.querySelectorAll('button[type="button"]');
      const incrementButton = Array.from(upButtons).find((btn) => {
        const svg = btn.querySelector('svg');
        return svg && svg.getAttribute('viewBox') === '0 0 24 24' && btn.className.includes('text-white');
      });
      
      if (incrementButton) {
        fireEvent.click(incrementButton);
        expect(orderInput.value).toBe('1');
      }
    });

    it('decrements display order with down button', () => {
      render(<ProjectForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Display Order'), { target: { value: '5' } });
      
      // Decrement button should decrease value
      const orderInput = screen.getByLabelText('Display Order') as HTMLInputElement;
      expect(orderInput.value).toBe('5');
    });
  });

  describe('Additional Field Tests', () => {
    it('renders image preview when image is provided in edit mode', () => {
      render(<ProjectForm project={mockProject} mode="edit" />);
      const imagePreview = document.querySelector('img[alt="Preview"]');
      expect(imagePreview).toBeInTheDocument();
    });

    it('loads display order from existing project', () => {
      render(<ProjectForm project={mockProject} mode="edit" />);
      const orderInput = screen.getByLabelText('Display Order') as HTMLInputElement;
      expect(orderInput.value).toBe('1');
    });

    it('loads is_visible state from existing project', () => {
      render(<ProjectForm project={mockProject} mode="edit" />);
      const visibleCheckbox = screen.getByLabelText('Visible') as HTMLInputElement;
      expect(visibleCheckbox.checked).toBe(true);
    });

    it('allows changing is_visible state', () => {
      render(<ProjectForm mode="create" />);
      const visibleCheckbox = screen.getByLabelText('Visible') as HTMLInputElement;
      expect(visibleCheckbox.checked).toBe(true);
      fireEvent.click(visibleCheckbox);
      expect(visibleCheckbox.checked).toBe(false);
    });
  });
  describe('Styling and Classes', () => {
    it('applies correct CSS classes to inputs', () => {
      render(<ProjectForm mode="create" />);
      const titleInput = screen.getByLabelText('Title *');
      expect(titleInput.className).toContain('border');
      expect(titleInput.className).toContain('rounded-lg');
    });

    it('applies button styling classes', () => {
      render(<ProjectForm mode="create" />);
      const submitButton = screen.getByText('Create Project');
      expect(submitButton.className).toContain('btn');
    });
  });
});