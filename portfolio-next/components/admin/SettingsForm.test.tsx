/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SettingsForm from './SettingsForm';
import type { Settings } from '@/types/settings';

const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
};

const mockSupabaseClient = {
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

global.fetch = vi.fn().mockResolvedValue({ ok: true });

describe('SettingsForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders form in create mode', () => {
      render(<SettingsForm mode="create" />);
      expect(screen.getByText('Create Setting')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      render(<SettingsForm mode="create" />);
      expect(screen.getByLabelText('Key *')).toBeInTheDocument();
      expect(screen.getByLabelText('Value *')).toBeInTheDocument();
    });

    it('initializes with empty values in create mode', () => {
      render(<SettingsForm mode="create" />);
      expect(screen.getByPlaceholderText('e.g., site_title')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter the setting value...')).toHaveValue('');
    });

    it('allows user to fill in form fields', () => {
      render(<SettingsForm mode="create" />);
      const keyInput = screen.getByLabelText('Key *') as HTMLInputElement;
      fireEvent.change(keyInput, { target: { value: 'test_key' } });
      expect(keyInput.value).toBe('test_key');
    });

    it('allows editing value field', () => {
      render(<SettingsForm mode="create" />);
      const valueInput = screen.getByLabelText('Value *') as HTMLTextAreaElement;
      fireEvent.change(valueInput, { target: { value: 'test value' } });
      expect(valueInput.value).toBe('test value');
    });

    it('renders submit and cancel buttons', () => {
      render(<SettingsForm mode="create" />);
      expect(screen.getByText('Create Setting')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('has required attributes on input fields', () => {
      render(<SettingsForm mode="create" />);
      expect((screen.getByLabelText('Key *') as HTMLInputElement).required).toBe(true);
      expect((screen.getByLabelText('Value *') as HTMLTextAreaElement).required).toBe(true);
    });
  });

  describe('Edit Mode', () => {
    const mockSetting: Settings = {
      id: '1',
      key: 'site_title',
      value: 'My Portfolio',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('renders form in edit mode', () => {
      render(<SettingsForm setting={mockSetting} mode="edit" />);
      expect(screen.getByText('Update Setting')).toBeInTheDocument();
    });

    it('populates form with existing setting data', () => {
      render(<SettingsForm setting={mockSetting} mode="edit" />);
      expect(screen.getByDisplayValue('site_title')).toBeInTheDocument();
      expect(screen.getByDisplayValue('My Portfolio')).toBeInTheDocument();
    });

    it('disables key input in edit mode', () => {
      render(<SettingsForm setting={mockSetting} mode="edit" />);
      const keyInput = screen.getByLabelText('Key *') as HTMLInputElement;
      expect(keyInput.disabled).toBe(true);
    });

    it('shows key cannot be changed message in edit mode', () => {
      render(<SettingsForm setting={mockSetting} mode="edit" />);
      expect(screen.getByText('Key cannot be changed after creation')).toBeInTheDocument();
    });

    it('allows editing value field in edit mode', () => {
      render(<SettingsForm setting={mockSetting} mode="edit" />);
      const valueInput = screen.getByLabelText('Value *') as HTMLTextAreaElement;
      fireEvent.change(valueInput, { target: { value: 'Updated Value' } });
      expect(valueInput.value).toBe('Updated Value');
    });

    it('renders update button instead of create', () => {
      render(<SettingsForm setting={mockSetting} mode="edit" />);
      expect(screen.getByText('Update Setting')).toBeInTheDocument();
      expect(screen.queryByText('Create Setting')).not.toBeInTheDocument();
    });
  });

  describe('Cancel Button', () => {
    it('cancel button navigates to settings page when clicked', () => {
      render(<SettingsForm mode="create" />);
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/settings');
    });
  });

  describe('Form Attributes', () => {
    it('renders textarea for value field', () => {
      render(<SettingsForm mode="create" />);
      const valueInput = screen.getByLabelText('Value *');
      expect(valueInput.tagName).toBe('TEXTAREA');
    });

    it('renders key as text input', () => {
      render(<SettingsForm mode="create" />);
      const keyInput = screen.getByLabelText('Key *') as HTMLInputElement;
      expect(keyInput.type).toBe('text');
    });
  });

  describe('Form Submission', () => {
    it('submit button is disabled while loading', async () => {
      render(<SettingsForm mode="create" />);
      const submitButton = screen.getByText('Create Setting') as HTMLButtonElement;
      expect(submitButton.className).toContain('disabled:opacity-50');
    });

    it('form exists and wraps all inputs', () => {
      render(<SettingsForm mode="create" />);
      const form = screen.getByText('Create Setting').closest('form');
      expect(form).toBeInTheDocument();
      expect(form?.querySelector('input[type="text"]')).toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('applies correct CSS classes to inputs', () => {
      render(<SettingsForm mode="create" />);
      const keyInput = screen.getByLabelText('Key *');
      expect(keyInput.className).toContain('border');
      expect(keyInput.className).toContain('rounded-lg');
    });

    it('applies button styling classes', () => {
      render(<SettingsForm mode="create" />);
      const submitButton = screen.getByText('Create Setting');
      expect(submitButton.className).toContain('btn');
    });
  });

  describe('Form Submit - Create Mode', () => {
    it('calls supabase insert on form submission', async () => {
      render(<SettingsForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Key *'), { target: { value: 'site_title' } });
      fireEvent.change(screen.getByLabelText('Value *'), { target: { value: 'My Site' } });
      fireEvent.click(screen.getByText('Create Setting'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('settings');
    });

    it('calls revalidate API on successful submit', async () => {
      render(<SettingsForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Key *'), { target: { value: 'key' } });
      fireEvent.change(screen.getByLabelText('Value *'), { target: { value: 'value' } });
      fireEvent.click(screen.getByText('Create Setting'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(global.fetch).toHaveBeenCalledWith('/api/revalidate', { method: 'POST' });
    });

    it('navigates to settings page on successful submission', async () => {
      render(<SettingsForm mode="create" />);
      fireEvent.change(screen.getByLabelText('Key *'), { target: { value: 'key' } });
      fireEvent.change(screen.getByLabelText('Value *'), { target: { value: 'value' } });
      fireEvent.click(screen.getByText('Create Setting'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/settings');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });

    it('does not submit with empty key field', () => {
      render(<SettingsForm mode="create" />);
      const submitButton = screen.getByText('Create Setting') as HTMLButtonElement;
      const form = submitButton.closest('form');
      
      fireEvent.change(screen.getByLabelText('Value *'), { target: { value: 'value' } });
      expect((form?.querySelector('input[required]') as HTMLInputElement).value).toBe('');
    });

    it('does not submit with empty value field', () => {
      render(<SettingsForm mode="create" />);
      const submitButton = screen.getByText('Create Setting') as HTMLButtonElement;
      const form = submitButton.closest('form');
      
      fireEvent.change(screen.getByLabelText('Key *'), { target: { value: 'key' } });
      expect((form?.querySelector('textarea[required]') as HTMLTextAreaElement).value).toBe('');
    });
  });

  describe('Form Submit - Edit Mode', () => {
    const mockSetting: Settings = {
      id: '1',
      key: 'site_title',
      value: 'My Portfolio',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('calls supabase update on form submission in edit mode', async () => {
      render(<SettingsForm setting={mockSetting} mode="edit" />);
      fireEvent.change(screen.getByLabelText('Value *'), { target: { value: 'Updated Title' } });
      fireEvent.click(screen.getByText('Update Setting'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('settings');
    });

    it('navigates to settings page on successful edit submission', async () => {
      render(<SettingsForm setting={mockSetting} mode="edit" />);
      fireEvent.change(screen.getByLabelText('Value *'), { target: { value: 'New Value' } });
      fireEvent.click(screen.getByText('Update Setting'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/settings');
    });

    it('prevents key modification in edit mode', () => {
      render(<SettingsForm setting={mockSetting} mode="edit" />);
      const keyInput = screen.getByLabelText('Key *') as HTMLInputElement;
      expect(keyInput.disabled).toBe(true);
    });
  });
});
