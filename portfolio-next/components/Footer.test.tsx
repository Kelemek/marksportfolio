import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {
  it('renders the footer element with contentinfo role', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('renders GitHub social link', () => {
    render(<Footer />);
    const githubLink = screen.getByTitle('Link to GitHub Profile');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/kelemek/');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders LinkedIn social link', () => {
    render(<Footer />);
    const linkedinLink = screen.getByTitle('Link to LinkedIn Profile');
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/mark-larson-a33b3588');
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders social media icons with correct alt text', () => {
    render(<Footer />);
    const githubIcon = screen.getByAltText('GitHub');
    const linkedinIcon = screen.getByAltText('LinkedIn');
    const partnersIcon = screen.getByAltText('Romans 8 Partners');
    expect(githubIcon).toBeInTheDocument();
    expect(linkedinIcon).toBeInTheDocument();
    expect(partnersIcon).toBeInTheDocument();
    expect(partnersIcon).toHaveAttribute('src', '/images/r8-icon.png');
    expect(partnersIcon).toHaveClass(
      'h-10',
      'w-10',
      'object-contain',
      'transition-transform',
      'hover:scale-110',
    );
  });

  it('renders the Romans 8 Partners logo immediately after LinkedIn', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('title'))).toEqual([
      'Link to GitHub Profile',
      'Link to LinkedIn Profile',
      'Link to Romans 8 Partners',
    ]);

    const partners = screen.getByRole('link', { name: 'Romans 8 Partners' });
    expect(partners).toHaveAttribute('href', 'https://partners.romans8.net');
    expect(partners).toHaveAttribute('target', '_blank');
    expect(partners).toHaveAttribute('rel', 'noopener noreferrer');
    expect(partners).toHaveAttribute('title', 'Link to Romans 8 Partners');
    expect(partners.textContent?.trim()).toBe('');
    expect(partners).toContainElement(screen.getByAltText('Romans 8 Partners'));
  });

  it('renders all social links in a list', () => {
    render(<Footer />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('applies correct list semantics', () => {
    render(<Footer />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });
});
