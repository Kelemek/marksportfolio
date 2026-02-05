import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactSection from './ContactSection';

describe('ContactSection Component', () => {
  it('renders the section with contact id', () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector('section#contact');
    expect(section).toBeInTheDocument();
  });

  it('renders the "Get in Touch" heading', () => {
    render(<ContactSection />);
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
  });

  it('renders the contact description', () => {
    render(<ContactSection />);
    expect(screen.getByText(/quickest way to reach me is via email/)).toBeInTheDocument();
  });

  it('renders the email link with correct href', () => {
    render(<ContactSection />);
    const emailLink = screen.getByRole('link', { name: /markdlarson@me.com/ });
    expect(emailLink).toHaveAttribute('href', 'mailto:markdlarson@me.com');
  });

  it('applies button styling to email link', () => {
    render(<ContactSection />);
    const emailLink = screen.getByRole('link', { name: /markdlarson@me.com/ });
    expect(emailLink).toHaveClass('btn');
  });

  it('uses semantic section element', () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector('section.contact');
    expect(section).toBeInTheDocument();
  });
});
