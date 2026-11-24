import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutSection from './AboutSection';

describe('AboutSection Component', () => {
  it('renders the section with about id', () => {
    const { container } = render(<AboutSection />);
    const section = container.querySelector('section#about');
    expect(section).toBeInTheDocument();
  });

  it('renders the "About Me" heading', () => {
    render(<AboutSection />);
    expect(screen.getByText('About Me')).toBeInTheDocument();
  });

  it('renders the self portrait image', () => {
    render(<AboutSection />);
    const image = screen.getByAltText(/self portrait/);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('self_portrait'));
  });

  it('displays the bio paragraphs', () => {
    render(<AboutSection />);
    expect(screen.getByText(/systems engineer with over 30 years/)).toBeInTheDocument();
    expect(screen.queryByText(/29 years/)).not.toBeInTheDocument();
    expect(screen.getByText(/ACBC certified Biblical counselor/)).toBeInTheDocument();
    expect(
      screen.getByText(/coach local small businesses through my AI consulting practice/),
    ).toBeInTheDocument();
    expect(screen.getByText(/practical AI tools/)).toBeInTheDocument();
  });

  it('links Romans 8 Partners from the consulting sentence', () => {
    render(<AboutSection />);
    const partners = screen.getByRole('link', { name: 'Romans 8 Partners' });
    expect(partners).toHaveAttribute('href', 'https://partners.romans8.net');
    expect(partners).toHaveAttribute('target', '_blank');
    expect(partners).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders resume link with correct attributes', () => {
    render(<AboutSection />);
    const resumeLink = screen.getByRole('link', { name: /My Resumé/ });
    expect(resumeLink).toHaveAttribute('href', 'https://resume.romans8.net');
    expect(resumeLink).toHaveAttribute('target', '_blank');
    expect(resumeLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('applies button styling to resume link', () => {
    render(<AboutSection />);
    const resumeLink = screen.getByRole('link', { name: /My Resumé/ });
    expect(resumeLink).toHaveClass('btn');
  });

  it('uses proper semantic section element', () => {
    const { container } = render(<AboutSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('about');
  });
});
