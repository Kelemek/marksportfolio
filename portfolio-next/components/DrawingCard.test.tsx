import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DrawingCard from './DrawingCard';
import type { Project } from '@/types/project';

const mockDrawing: Project = {
  id: '1',
  title: 'Portrait Study',
  description: 'A detailed portrait study created on iPad',
  image_url: '/images/drawing1.jpg',
  image_alt: 'Portrait Study - iPad Drawing',
  site_url: null,
  github_url: null,
  slug: 'portrait-study',
  technologies: ['Procreate', 'iPad Pro'],
  type: 'drawing',
  display_order: 1,
  is_visible: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('DrawingCard Component', () => {
  it('renders the drawing title', () => {
    render(<DrawingCard project={mockDrawing} />);
    expect(screen.getByText('Portrait Study')).toBeInTheDocument();
  });

  it('renders the drawing description', () => {
    render(<DrawingCard project={mockDrawing} />);
    expect(screen.getByText('A detailed portrait study created on iPad')).toBeInTheDocument();
  });

  it('renders tools/techniques as a list', () => {
    render(<DrawingCard project={mockDrawing} />);
    expect(screen.getByText('Procreate')).toBeInTheDocument();
    expect(screen.getByText('iPad Pro')).toBeInTheDocument();
  });

  it('renders details link with correct slug', () => {
    render(<DrawingCard project={mockDrawing} />);
    const link = screen.getByRole('link', { name: /Details/ });
    expect(link).toHaveAttribute('href', '/projects/portrait-study');
  });

  it('renders as article element', () => {
    render(<DrawingCard project={mockDrawing} />);
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
  });

  it('does not render description if not provided', () => {
    const drawingWithoutDesc = { ...mockDrawing, description: null };
    render(<DrawingCard project={drawingWithoutDesc} />);
    expect(screen.queryByText('A detailed portrait study created on iPad')).not.toBeInTheDocument();
  });

  it('does not render tools list when empty', () => {
    const drawingWithoutTools = { ...mockDrawing, technologies: [] };
    render(<DrawingCard project={drawingWithoutTools} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('parses comma-separated tools string', () => {
    const drawingWithStringTools = {
      ...mockDrawing,
      technologies: 'Procreate, Sketch, Illustrator' as unknown as string[],
    };
    render(<DrawingCard project={drawingWithStringTools as Project} />);
    expect(screen.getByText('Procreate')).toBeInTheDocument();
    expect(screen.getByText('Sketch')).toBeInTheDocument();
    expect(screen.getByText('Illustrator')).toBeInTheDocument();
  });

  it('renders image with custom alt text when provided', () => {
    render(<DrawingCard project={mockDrawing} />);
    const image = screen.getByAltText('Portrait Study - iPad Drawing');
    expect(image).toBeInTheDocument();
    expect(image.closest('a')).toHaveAttribute('href', '/images/drawing1.jpg');
    expect(image.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('renders image with title as fallback alt text', () => {
    const drawingWithoutAlt = { ...mockDrawing, image_alt: null };
    render(<DrawingCard project={drawingWithoutAlt} />);
    const image = screen.getByAltText('Portrait Study');
    expect(image).toBeInTheDocument();
  });

  it('renders no image available message when image_url is not present', () => {
    const drawingWithoutImage = { ...mockDrawing, image_url: null };
    render(<DrawingCard project={drawingWithoutImage} />);
    expect(screen.getByText('No image available')).toBeInTheDocument();
  });

  it('links image to image_url with external link attributes', () => {
    render(<DrawingCard project={mockDrawing} />);
    const link = screen.getByAltText('Portrait Study - iPad Drawing').closest('a');
    expect(link).toHaveAttribute('href', '/images/drawing1.jpg');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles technologies as null or undefined', () => {
    const drawingWithNullTechs = { 
      ...mockDrawing, 
      technologies: null as unknown as string[]
    };
    render(<DrawingCard project={drawingWithNullTechs as Project} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('handles technologies as undefined', () => {
    const drawingWithUndefinedTechs = { 
      ...mockDrawing, 
      technologies: undefined as unknown as string[]
    };
    render(<DrawingCard project={drawingWithUndefinedTechs as Project} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
