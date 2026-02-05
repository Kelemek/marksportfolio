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
    expect(githubIcon).toBeInTheDocument();
    expect(linkedinIcon).toBeInTheDocument();
  });

  it('renders all social links in a list', () => {
    render(<Footer />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
  });

  it('applies correct list semantics', () => {
    render(<Footer />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });
});
