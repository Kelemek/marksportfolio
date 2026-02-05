import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminSkillsClient from './AdminSkillsClient';
import type { Skill } from '@/types/skill';

// Mock the SortableSkillList component to simplify testing
vi.mock('./SortableSkillList', () => ({
  default: ({ initialSkills, category }: { initialSkills: Skill[]; category: string }) => (
    <div data-testid={`sortable-${category}`}>
      {initialSkills.map((skill) => (
        <div key={skill.id}>{skill.name}</div>
      ))}
    </div>
  ),
}));

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockSystemsSkills: Skill[] = [
  {
    id: '1',
    name: 'Linux',
    years: '15',
    category: 'systems',
    sort_order: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Networking',
    years: '12',
    category: 'systems',
    sort_order: 2,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

const mockDevSkills: Skill[] = [
  {
    id: '3',
    name: 'React',
    years: '3',
    category: 'development',
    sort_order: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '4',
    name: 'TypeScript',
    years: '2',
    category: 'development',
    sort_order: 2,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

describe('AdminSkillsClient Component', () => {
  it('renders systems skills section', () => {
    render(
      <AdminSkillsClient systemsSkills={mockSystemsSkills} developmentSkills={[]} />
    );
    expect(screen.getByText(/Systems Skills/)).toBeInTheDocument();
  });

  it('renders development skills section', () => {
    render(
      <AdminSkillsClient systemsSkills={[]} developmentSkills={mockDevSkills} />
    );
    expect(screen.getByText(/Development Skills/)).toBeInTheDocument();
  });

  it('displays count of systems skills', () => {
    render(
      <AdminSkillsClient systemsSkills={mockSystemsSkills} developmentSkills={[]} />
    );
    expect(screen.getByText('Systems Skills (2)')).toBeInTheDocument();
  });

  it('displays count of development skills', () => {
    render(
      <AdminSkillsClient systemsSkills={[]} developmentSkills={mockDevSkills} />
    );
    expect(screen.getByText('Development Skills (2)')).toBeInTheDocument();
  });

  it('renders drag instruction text', () => {
    render(
      <AdminSkillsClient systemsSkills={mockSystemsSkills} developmentSkills={mockDevSkills} />
    );
    const dragTexts = screen.getAllByText('Drag rows to reorder');
    expect(dragTexts).toHaveLength(2);
  });

  it('renders SortableSkillList for systems skills', () => {
    render(
      <AdminSkillsClient systemsSkills={mockSystemsSkills} developmentSkills={[]} />
    );
    const sortableList = screen.getByTestId('sortable-systems');
    expect(sortableList).toBeInTheDocument();
    expect(screen.getByText('Linux')).toBeInTheDocument();
    expect(screen.getByText('Networking')).toBeInTheDocument();
  });

  it('renders SortableSkillList for development skills', () => {
    render(
      <AdminSkillsClient systemsSkills={[]} developmentSkills={mockDevSkills} />
    );
    const sortableList = screen.getByTestId('sortable-development');
    expect(sortableList).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders both sections when skills exist in both categories', () => {
    render(
      <AdminSkillsClient systemsSkills={mockSystemsSkills} developmentSkills={mockDevSkills} />
    );
    expect(screen.getByText('Systems Skills (2)')).toBeInTheDocument();
    expect(screen.getByText('Development Skills (2)')).toBeInTheDocument();
  });

  it('displays zero count when no systems skills', () => {
    render(
      <AdminSkillsClient systemsSkills={[]} developmentSkills={mockDevSkills} />
    );
    expect(screen.getByText('Systems Skills (0)')).toBeInTheDocument();
  });

  it('displays zero count when no development skills', () => {
    render(
      <AdminSkillsClient systemsSkills={mockSystemsSkills} developmentSkills={[]} />
    );
    expect(screen.getByText('Development Skills (0)')).toBeInTheDocument();
  });

  it('uses semantic section elements', () => {
    const { container } = render(
      <AdminSkillsClient systemsSkills={mockSystemsSkills} developmentSkills={mockDevSkills} />
    );
    const sections = container.querySelectorAll('section.admin-section');
    expect(sections).toHaveLength(2);
  });
});
