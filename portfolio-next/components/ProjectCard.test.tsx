import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectCard from './ProjectCard';
import type { Project } from '@/types/project';

const mockProject: Project = {
  id: '1',
  title: 'E-commerce Platform',
  description: 'A full-stack e-commerce solution',
  image_url: '/images/project1.jpg',
  image_alt: 'E-commerce Platform Preview',
  site_url: 'https://example.com',
  github_url: 'https://github.com/example/project',
  slug: 'ecommerce-platform',
  technologies: ['React', 'Node.js', 'PostgreSQL'],
  type: 'coding',
  display_order: 1,
  is_visible: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('ProjectCard Component', () => {
  it('renders the project title', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
  });

  it('renders the project description', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('A full-stack e-commerce solution')).toBeInTheDocument();
  });

  it('renders technologies as a list', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  it('renders details link with correct slug', () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole('link', { name: /Details/ });
    expect(link).toHaveAttribute('href', '/projects/ecommerce-platform');
  });

  it('does not render technologies list when empty', () => {
    const projectWithoutTechs = { ...mockProject, technologies: [] };
    render(<ProjectCard project={projectWithoutTechs} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders as article element', () => {
    render(<ProjectCard project={mockProject} />);
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
  });

  it('does not render description if not provided', () => {
    const projectWithoutDesc = { ...mockProject, description: null };
    render(<ProjectCard project={projectWithoutDesc} />);
    expect(screen.queryByText('A full-stack e-commerce solution')).not.toBeInTheDocument();
  });

  it('parses comma-separated technologies string', () => {
    const projectWithStringTechs = {
      ...mockProject,
      technologies: 'React, Vue, Angular' as unknown as string[],
    };
    render(<ProjectCard project={projectWithStringTechs as Project} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
    expect(screen.getByText('Angular')).toBeInTheDocument();
  });

  it('renders iframe when mode is iframe and site_url is present', () => {
    render(<ProjectCard project={mockProject} mode="iframe" />);
    const iframe = screen.getByTitle(/Interactive Demo/);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://example.com');
    expect(iframe).toHaveAttribute('loading', 'lazy');
  });

  it('renders visit link when site_url is present', () => {
    render(<ProjectCard project={mockProject} />);
    const visitLink = screen.getByRole('link', { name: /Visit/ });
    expect(visitLink).toHaveAttribute('href', 'https://example.com');
    expect(visitLink).toHaveAttribute('target', '_blank');
  });

  it('renders GitHub icon link when github_url is present', () => {
    render(<ProjectCard project={mockProject} />);
    const githubLink = screen.getByAltText('View Source Code on GitHub');
    expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/example/project');
    expect(githubLink.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('does not render visit link when site_url is not present', () => {
    const projectWithoutSiteUrl = { ...mockProject, site_url: null };
    render(<ProjectCard project={projectWithoutSiteUrl} />);
    expect(screen.queryByRole('link', { name: /Visit/ })).not.toBeInTheDocument();
  });

  it('does not render GitHub link when github_url is not present', () => {
    const projectWithoutGithub = { ...mockProject, github_url: null };
    render(<ProjectCard project={projectWithoutGithub} />);
    expect(screen.queryByAltText('View Source Code on GitHub')).not.toBeInTheDocument();
  });

  it('renders image when mode is image and no site_url', () => {
    const projectImageOnly = { ...mockProject, site_url: null };
    render(<ProjectCard project={projectImageOnly} mode="image" />);
    const image = screen.getByAltText('E-commerce Platform Preview');
    expect(image).toBeInTheDocument();
  });

  it('renders no preview message when no image or iframe can be shown', () => {
    const projectNoPreview = { 
      ...mockProject, 
      site_url: null, 
      image_url: null 
    };
    render(<ProjectCard project={projectNoPreview} mode="image" />);
    expect(screen.getByText('No preview available')).toBeInTheDocument();
  });

  it('uses image_alt when provided', () => {
    const projectWithAlt = { 
      ...mockProject, 
      site_url: null,
      image_alt: 'Custom alt text'
    };
    render(<ProjectCard project={projectWithAlt} mode="image" />);
    expect(screen.getByAltText('Custom alt text')).toBeInTheDocument();
  });

  it('falls back to title as alt text when image_alt is not provided', () => {
    const projectWithoutAlt = { 
      ...mockProject, 
      site_url: null,
      image_alt: null
    };
    render(<ProjectCard project={projectWithoutAlt} mode="image" />);
    expect(screen.getByAltText('E-commerce Platform')).toBeInTheDocument();
  });

  it('handles technologies as null or undefined', () => {
    const projectWithNullTechs = { 
      ...mockProject, 
      technologies: null as unknown as string[]
    };
    render(<ProjectCard project={projectWithNullTechs as Project} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('handles technologies as undefined', () => {
    const projectWithUndefinedTechs = { 
      ...mockProject, 
      technologies: undefined as unknown as string[]
    };
    render(<ProjectCard project={projectWithUndefinedTechs as Project} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
