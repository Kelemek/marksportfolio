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
    const emailLink = screen.getByRole('link', { name: 'markdlarson@me.com' });
    expect(emailLink).toHaveAttribute('href', 'mailto:markdlarson@me.com');
  });

  it('applies button styling to email link', () => {
    render(<ContactSection />);
    const emailLink = screen.getByRole('link', { name: 'markdlarson@me.com' });
    expect(emailLink).toHaveClass('btn');
    expect(screen.getAllByRole('link', { name: 'markdlarson@me.com' })).toHaveLength(1);
  });

  it('points small-business consulting inquiries to Partners', () => {
    render(<ContactSection />);
    expect(screen.getByText(/small-business AI consulting/)).toBeInTheDocument();

    const site = screen.getByRole('link', { name: 'Romans 8 Partners' });
    expect(site).toHaveAttribute('href', 'https://partners.romans8.net');
    expect(site).toHaveAttribute('target', '_blank');
    expect(site).toHaveAttribute('rel', 'noopener noreferrer');

    const email = screen.getByRole('link', { name: 'partners@romans8.net' });
    expect(email).toHaveAttribute('href', 'mailto:partners@romans8.net');
  });

  it('uses semantic section element', () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector('section.contact');
    expect(section).toBeInTheDocument();
  });
});
