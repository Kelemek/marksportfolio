import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminProjectsClient from './AdminProjectsClient';
import type { Project } from '@/types/project';

// Mock router
const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock SortableProjectList with actual handler testing
vi.mock('./SortableProjectList', () => ({
  default: ({ initialProjects, type, onToggleVisibility }: { initialProjects: Project[]; type: string; onToggleVisibility: (id: string, visibility: boolean) => void }) => (
    <div data-testid={`sortable-${type}`}>
      {initialProjects.map((project) => (
        <div key={project.id} data-testid={`project-${project.id}`}>
          <span>{project.title}</span>
          <button 
            data-testid={`toggle-${project.id}`}
            onClick={() => onToggleVisibility(project.id, project.is_visible)}
          >
            Toggle Visibility
          </button>
        </div>
      ))}
    </div>
  ),
}));

const mockCodingProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Site',
    description: 'Full-stack e-commerce',
    slug: 'ecommerce-site',
    technologies: ['React', 'Node.js'],
    type: 'coding',
    display_order: 1,
    is_visible: true,
    site_url: 'https://example.com',
    github_url: 'https://github.com/example',
    image_url: null,
    image_alt: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

const mockDrawingProjects: Project[] = [
  {
    id: '2',
    title: 'Portrait Series',
    description: 'Digital portraits',
    slug: 'portrait-series',
    site_url: null,
    github_url: null,
    image_url: '/images/portrait.jpg',
    image_alt: 'Portrait series',
    technologies: ['Procreate'],
    type: 'drawing',
    display_order: 1,
    is_visible: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

const mockFetch = vi.mocked(global.fetch);

describe('AdminProjectsClient Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockRouter.refresh.mockClear();
    mockRouter.push.mockClear();
  });

  it('renders coding projects section', () => {
    render(
      <AdminProjectsClient codingProjects={mockCodingProjects} drawingProjects={[]} />
    );
    expect(screen.getByText(/Coding Projects/)).toBeInTheDocument();
  });

  it('renders drawing projects section', () => {
    render(
      <AdminProjectsClient codingProjects={[]} drawingProjects={mockDrawingProjects} />
    );
    expect(screen.getByText(/Drawing Projects/)).toBeInTheDocument();
  });

  it('displays correct count for coding projects', () => {
    render(
      <AdminProjectsClient codingProjects={mockCodingProjects} drawingProjects={[]} />
    );
    expect(screen.getByText('Coding Projects (1)')).toBeInTheDocument();
  });

  it('displays correct count for drawing projects', () => {
    render(
      <AdminProjectsClient codingProjects={[]} drawingProjects={mockDrawingProjects} />
    );
    expect(screen.getByText('Drawing Projects (1)')).toBeInTheDocument();
  });

  it('displays drag instructions', () => {
    render(
      <AdminProjectsClient codingProjects={mockCodingProjects} drawingProjects={mockDrawingProjects} />
    );
    const dragTexts = screen.getAllByText('Drag rows to reorder');
    expect(dragTexts).toHaveLength(2);
  });

  it('renders SortableProjectList for coding projects', () => {
    render(
      <AdminProjectsClient codingProjects={mockCodingProjects} drawingProjects={[]} />
    );
    expect(screen.getByTestId('sortable-coding')).toBeInTheDocument();
    expect(screen.getByText('E-commerce Site')).toBeInTheDocument();
  });

  it('renders SortableProjectList for drawing projects', () => {
    render(
      <AdminProjectsClient codingProjects={[]} drawingProjects={mockDrawingProjects} />
    );
    expect(screen.getByTestId('sortable-drawing')).toBeInTheDocument();
    expect(screen.getByText('Portrait Series')).toBeInTheDocument();
  });

  it('displays zero counts when no projects', () => {
    render(
      <AdminProjectsClient codingProjects={[]} drawingProjects={[]} />
    );
    expect(screen.getByText('Coding Projects (0)')).toBeInTheDocument();
    expect(screen.getByText('Drawing Projects (0)')).toBeInTheDocument();
  });

  it('uses semantic section elements', () => {
    const { container } = render(
      <AdminProjectsClient codingProjects={mockCodingProjects} drawingProjects={mockDrawingProjects} />
    );
    const sections = container.querySelectorAll('section.admin-section');
    expect(sections).toHaveLength(2);
  });

  describe('Visibility Toggle Handler', () => {
    it('calls visibility toggle API with correct payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(
        <AdminProjectsClient codingProjects={mockCodingProjects} drawingProjects={[]} />
      );

      const toggleButton = screen.getByTestId('toggle-1');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/projects/visibility',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: '1', is_visible: false }),
          })
        );
      });
    });

    it('calls router.refresh on successful visibility toggle', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(
        <AdminProjectsClient codingProjects={mockCodingProjects} drawingProjects={[]} />
      );

      const toggleButton = screen.getByTestId('toggle-1');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('toggles visibility from visible to hidden', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(
        <AdminProjectsClient codingProjects={mockCodingProjects} drawingProjects={[]} />
      );

      const toggleButton = screen.getByTestId('toggle-1');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/projects/visibility',
          expect.objectContaining({
            body: JSON.stringify({ id: '1', is_visible: false }),
          })
        );
      });
    });

    it('handles API errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(
        <AdminProjectsClient codingProjects={mockCodingProjects} drawingProjects={[]} />
      );

      const toggleButton = screen.getByTestId('toggle-1');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error toggling visibility:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('handles network errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <AdminProjectsClient codingProjects={mockCodingProjects} drawingProjects={[]} />
      );

      const toggleButton = screen.getByTestId('toggle-1');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('handles drawing project visibility toggle', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(
        <AdminProjectsClient codingProjects={[]} drawingProjects={mockDrawingProjects} />
      );

      const toggleButton = screen.getByTestId('toggle-2');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/projects/visibility',
          expect.objectContaining({
            body: JSON.stringify({ id: '2', is_visible: false }),
          })
        );
      });
    });

    it('handles multiple visibility toggles', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const multipleProjects: Project[] = [
        ...mockCodingProjects,
        {
          id: '3',
          title: 'Another Project',
          description: 'Test project',
          slug: 'another-project',
          technologies: ['TypeScript'],
          type: 'coding',
          display_order: 2,
          is_visible: true,
          site_url: null,
          github_url: null,
          image_url: null,
          image_alt: null,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      render(
        <AdminProjectsClient codingProjects={multipleProjects} drawingProjects={[]} />
      );

      const toggleButton1 = screen.getByTestId('toggle-1');
      const toggleButton3 = screen.getByTestId('toggle-3');

      fireEvent.click(toggleButton1);
      fireEvent.click(toggleButton3);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });
});
