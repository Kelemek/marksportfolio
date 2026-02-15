import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeployResumeButton from './DeployResumeButton';

describe('DeployResumeButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button with initial text', () => {
    render(<DeployResumeButton />);
    expect(screen.getByRole('button', { name: /Redeploy Resume/ })).toBeInTheDocument();
  });

  it('disables button and shows loading state during deployment', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve(
              new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
              })
            ),
          100
        )
      )
    ));

    render(<DeployResumeButton />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(screen.getByRole('button', { name: /Deploying/ })).toBeInTheDocument();
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('shows success message after successful deployment', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    ));

    render(<DeployResumeButton />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Deploy Started/ })).toBeInTheDocument();
    });
  });

  it('shows error message on deployment failure', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Failed' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      )
    ));

    render(<DeployResumeButton />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Deploy Failed/ })).toBeInTheDocument();
    });
  });

  it('calls deploy API endpoint on click', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<DeployResumeButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/deploy-resume', {
        method: 'POST',
      });
    });
  });

  it('applies correct styling classes for default state', () => {
    render(<DeployResumeButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-4', 'py-2', 'rounded-lg', 'font-medium', 'transition-colors');
  });

  it('applies success styling when deployment succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    ));

    render(<DeployResumeButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-600', 'text-white');
    });
  });

  it('applies error styling when deployment fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Failed' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      )
    ));

    render(<DeployResumeButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'text-white');
    });
  });

  it('disables button when loading', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      new Promise((resolve) =>
        setTimeout(() =>
          resolve(
            new Response(JSON.stringify({ success: true }), {
              status: 200,
              headers: { 'content-type': 'application/json' },
            })
          ),
          50
        )
      )
    ));

    render(<DeployResumeButton />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('handles network errors gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.reject(new Error('Network error'))
    ));

    render(<DeployResumeButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Deploy Failed/ })).toBeInTheDocument();
    });
  });

  it('renders success checkmark in success state', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    ));

    render(<DeployResumeButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/✓/)).toBeInTheDocument();
    });
  });

  it('renders error icon in error state', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Failed' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      )
    ));

    render(<DeployResumeButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/✗/)).toBeInTheDocument();
    });
  });

  it('resets to idle state after success timeout', async () => {
    const originalSetTimeout = global.setTimeout;
    vi.stubGlobal(
      'setTimeout',
      (callback: () => void) => {
        const wrapped = () => {
          vi.stubGlobal('setTimeout', originalSetTimeout);
          callback();
        };
        return originalSetTimeout(wrapped, 0) as unknown as ReturnType<typeof setTimeout>;
      }
    );

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    ));

    render(<DeployResumeButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Deploy Started/ })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Redeploy Resume/ })).toBeInTheDocument();
    });
  });

  it('resets to idle state after error timeout', async () => {
    const originalSetTimeout = global.setTimeout;
    vi.stubGlobal(
      'setTimeout',
      (callback: () => void) => {
        const wrapped = () => {
          vi.stubGlobal('setTimeout', originalSetTimeout);
          callback();
        };
        return originalSetTimeout(wrapped, 0) as unknown as ReturnType<typeof setTimeout>;
      }
    );

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Failed' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      )
    ));

    render(<DeployResumeButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Deploy Failed/ })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Redeploy Resume/ })).toBeInTheDocument();
    });
  });
});
