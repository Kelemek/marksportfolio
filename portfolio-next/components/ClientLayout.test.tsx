import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientLayout } from './ClientLayout';

// Mock Navigation component
vi.mock('./Navigation', () => ({
  default: () => <nav data-testid="mock-navigation">Navigation</nav>,
}));

describe('ClientLayout Component', () => {
  it('renders the Navigation component', () => {
    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );
    const nav = screen.getByTestId('mock-navigation');
    expect(nav).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <ClientLayout>
        <div>Test Child Content</div>
      </ClientLayout>
    );
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <ClientLayout>
        <div>First Child</div>
        <div>Second Child</div>
      </ClientLayout>
    );
    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
  });

  it('renders Navigation before children', () => {
    const { container } = render(
      <ClientLayout>
        <div>Content</div>
      </ClientLayout>
    );
    const fragment = container.firstChild;
    const nav = fragment?.childNodes[0];
    expect(nav?.textContent).toContain('Navigation');
  });

  it('is a client component that renders without server-side errors', () => {
    expect(() => {
      render(
        <ClientLayout>
          <span>Children rendered successfully</span>
        </ClientLayout>
      );
    }).not.toThrow();
  });
});
