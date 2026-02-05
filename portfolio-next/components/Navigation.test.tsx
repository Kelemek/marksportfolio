import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navigation from './Navigation';

// Mock next/navigation
const mockUsePathname = vi.fn(() => '/');

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('Navigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
    // Reset window scroll position
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  it('renders the navigation element with navigation role', () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: 'Coding' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Drawing' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Resumé' })).toBeInTheDocument();
  });

  it('renders hash links with correct href on homepage', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Navigation />);
    const codingLink = screen.getByRole('link', { name: 'Coding' });
    expect(codingLink).toHaveAttribute('href', '#work');
  });

  it('renders hash links as full paths on non-homepage', () => {
    mockUsePathname.mockReturnValue('/projects/my-project');
    const { rerender } = render(<Navigation />);
    rerender(<Navigation />);
    const codingLink = screen.getByRole('link', { name: 'Coding' });
    expect(codingLink).toHaveAttribute('href', '/#work');
  });

  it('renders resume as external link', () => {
    render(<Navigation />);
    const resumeLink = screen.getByRole('link', { name: 'Resumé' });
    expect(resumeLink).toHaveAttribute('href', 'https://resume.romans8.net');
    expect(resumeLink).toHaveAttribute('target', '_blank');
    expect(resumeLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders as list of navigation items', () => {
    render(<Navigation />);
    const list = screen.getByRole('list');
    const listItems = screen.getAllByRole('listitem');
    expect(list).toBeInTheDocument();
    expect(listItems).toHaveLength(5);
  });

  it('applies nav class to navigation element', () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('nav', 'fixed', 'top-0', 'left-0', 'right-0', 'z-[1000]');
  });

  it('applies nav__link class to all links', () => {
    render(<Navigation />);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveClass('nav__link');
    });
  });

  it('sets scroll progress on scroll event', async () => {
    const { container } = render(<Navigation />);
    const nav = screen.getByRole('navigation');

    // Simulate scroll event
    Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
    fireEvent.scroll(window, { target: { scrollY: 150 } });

    await waitFor(() => {
      const scrollProgress = nav.style.getPropertyValue('--scroll-progress');
      expect(scrollProgress).toBeDefined();
    });
  });

  it('adds nav--scrolled class when scrolling past threshold', async () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation');

    // Simulate scroll past threshold
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
    fireEvent.scroll(window, { target: { scrollY: 200 } });

    await waitFor(() => {
      expect(nav).toHaveClass('nav--scrolled');
    });
  });

  it('removes nav--scrolled class when scrolling back up', async () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation');

    // Simulate initial scroll
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
    fireEvent.scroll(window);

    // Then scroll back up
    Object.defineProperty(window, 'scrollY', { value: 10, writable: true });
    fireEvent.scroll(window);

    await waitFor(() => {
      const hasScrolledClass = nav.classList.contains('nav--scrolled');
      expect(hasScrolledClass).toBe(false);
    });
  });

  it('cleans up scroll listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<Navigation />);

    unmount();

    // Verify that removeEventListener was called with 'scroll' event and a function
    const calls = removeEventListenerSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0][0]).toBe('scroll');
    expect(typeof calls[0][1]).toBe('function');

    removeEventListenerSpy.mockRestore();
  });

  it('updates nav styling on initial scroll position > 0.05', () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 20, // 20/300 = 0.067 > 0.05
    });

    render(<Navigation />);
    const nav = screen.getByRole('navigation');

    expect(nav).toHaveClass('nav--scrolled');
  });
});
