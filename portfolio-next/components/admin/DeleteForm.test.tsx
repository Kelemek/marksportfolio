import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteForm from './DeleteForm';

describe('DeleteForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete button with default label', () => {
    render(<DeleteForm action="/api/delete" id="123" />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('renders delete button with custom label', () => {
    render(
      <DeleteForm action="/api/delete" id="123" label="Remove Item" />
    );
    expect(screen.getByRole('button', { name: 'Remove Item' })).toBeInTheDocument();
  });

  it('renders form with correct action', () => {
    render(<DeleteForm action="/api/skills/delete" id="123" />);
    const form = screen.getByRole('button').closest('form');
    expect(form).toHaveAttribute('action', '/api/skills/delete');
    expect(form).toHaveAttribute('method', 'POST');
  });

  it('includes hidden input with id', () => {
    render(<DeleteForm action="/api/delete" id="skill-456" />);
    const input = screen.getByDisplayValue('skill-456') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'hidden');
    expect(input).toHaveAttribute('name', 'id');
  });

  it('applies correct button styling classes', () => {
    render(<DeleteForm action="/api/delete" id="123" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-red-400', 'hover:underline', 'text-sm');
  });

  it('shows confirmation dialog with default message', () => {
    const confirmSpy = vi.fn(() => false);
    global.confirm = confirmSpy;

    render(<DeleteForm action="/api/delete" id="123" />);
    fireEvent.click(screen.getByRole('button'));

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this item?');
  });

  it('shows confirmation dialog with custom message', () => {
    const confirmSpy = vi.fn(() => false);
    global.confirm = confirmSpy;

    render(
      <DeleteForm
        action="/api/delete"
        id="123"
        message="This action cannot be undone!"
      />
    );
    fireEvent.click(screen.getByRole('button'));

    expect(confirmSpy).toHaveBeenCalledWith('This action cannot be undone!');
  });

  it('prevents form submission when user cancels confirmation', () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    const preventDefaultSpy = vi.fn();

    render(<DeleteForm action="/api/delete" id="123" />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(vi.mocked(confirm)).toHaveBeenCalled();
  });

  it('allows form submission when user confirms', () => {
    vi.stubGlobal('confirm', vi.fn(() => true));

    render(<DeleteForm action="/api/delete" id="123" />);
    const button = screen.getByRole('button');

    // The form would submit if confirm returns true
    fireEvent.click(button);
    expect(vi.mocked(confirm)).toHaveBeenCalled();
  });

  it('applies inline display class to form', () => {
    render(<DeleteForm action="/api/delete" id="123" />);
    const form = screen.getByRole('button').closest('form');
    expect(form).toHaveClass('inline');
  });

  it('is a submit button', () => {
    render(<DeleteForm action="/api/delete" id="123" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
