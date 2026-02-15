import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteButton from './DeleteButton';

describe('DeleteButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a delete button', () => {
    render(<DeleteButton projectId="123" projectTitle="Test Project" />);
    const button = screen.getByRole('button', { name: /Delete/ });
    expect(button).toBeInTheDocument();
  });

  it('has correct button styling classes', () => {
    render(<DeleteButton projectId="123" projectTitle="Test Project" />);
    const button = screen.getByRole('button', { name: /Delete/ });
    expect(button).toHaveClass('text-red-400', 'hover:underline', 'text-sm');
  });

  it('renders a form with correct action', () => {
    render(<DeleteButton projectId="123" projectTitle="Test Project" />);
    const form = screen.getByRole('button').closest('form');
    expect(form).toHaveAttribute('action', '/api/projects/delete');
    expect(form).toHaveAttribute('method', 'POST');
  });

  it('includes hidden input with project id', () => {
    render(<DeleteButton projectId="123" projectTitle="Test Project" />);
    const hiddenInput = screen.getByDisplayValue('123') as HTMLInputElement;
    expect(hiddenInput).toHaveAttribute('type', 'hidden');
    expect(hiddenInput).toHaveAttribute('name', 'id');
  });

  it('submits form when user confirms deletion', () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    render(<DeleteButton projectId="123" projectTitle="Test Project" />);
    const button = screen.getByRole('button', { name: /Delete/ });
    
    fireEvent.click(button);
    expect(vi.mocked(confirm)).toHaveBeenCalledWith('Are you sure you want to delete "Test Project"?');
  });

  it('prevents form submission when user cancels confirmation', () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    
    render(<DeleteButton projectId="123" projectTitle="Test Project" />);
    const button = screen.getByRole('button', { name: /Delete/ });
    
    fireEvent.click(button);
    expect(vi.mocked(confirm)).toHaveBeenCalledWith('Are you sure you want to delete "Test Project"?');
  });

  it('displays correct project title in confirmation dialog', () => {
    vi.stubGlobal('confirm', vi.fn());
    const projectTitle = 'My Awesome Project';
    
    render(<DeleteButton projectId="456" projectTitle={projectTitle} />);
    const button = screen.getByRole('button', { name: /Delete/ });
    
    fireEvent.click(button);
    expect(vi.mocked(confirm)).toHaveBeenCalledWith(`Are you sure you want to delete "${projectTitle}"?`);
  });
});
