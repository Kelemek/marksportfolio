import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
  it('renders the header banner element', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('displays the name "Mark Larson"', () => {
    render(<Header />);
    const name = screen.getByText('Mark Larson');
    expect(name).toBeInTheDocument();
  });

  it('displays the subtitle text', () => {
    render(<Header />);
    const subtitle = screen.getByText(/A Front-End Developer coding/);
    expect(subtitle).toBeInTheDocument();
  });

  it('renders the "Get in touch" button', () => {
    render(<Header />);
    const button = screen.getByRole('link', { name: /Get in touch/ });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '#contact');
  });

  it('has correct header id', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('id', 'top');
  });

  it('applies banner role for accessibility', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('role', 'banner');
  });

  it('has background image styling applied', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({
      backgroundImage: expect.stringContaining('linear-gradient'),
    });
  });
});
