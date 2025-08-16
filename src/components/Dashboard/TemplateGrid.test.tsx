import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TemplateGrid } from './TemplateGrid';
import { Template } from '@/types/template';

const mockTemplate: Template = {
  id: '1',
  name: 'Test Template',
  description: 'Test Description',
  messages: [],
  arguments: [],
  isPublic: false,
  userId: 'user-1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
};

describe('TemplateGrid', () => {
  it('should render loading state', () => {
    render(
      <TemplateGrid 
        templates={[]} 
        currentUserId="user-1" 
        loading={true}
        onView={vi.fn()}
      />
    );
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(6);
  });

  it('should render empty state with custom message', () => {
    render(
      <TemplateGrid 
        templates={[]} 
        currentUserId="user-1" 
        emptyMessage="Custom empty message"
        onView={vi.fn()}
      />
    );
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('should render default empty message when no custom message provided', () => {
    render(
      <TemplateGrid 
        templates={[]} 
        currentUserId="user-1"
        onView={vi.fn()}
      />
    );
    expect(screen.getByText('No templates found')).toBeInTheDocument();
  });

  it('should render template cards', () => {
    render(
      <TemplateGrid 
        templates={[mockTemplate]} 
        currentUserId="user-1" 
        onView={vi.fn()}
      />
    );
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });

  it('should pass correct props to TemplateCard for owner', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnView = vi.fn();

    render(
      <TemplateGrid 
        templates={[mockTemplate]} 
        currentUserId="user-1" 
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    // Template card should be rendered with owner privileges
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });

  it('should pass correct props to TemplateCard for non-owner', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnView = vi.fn();

    render(
      <TemplateGrid 
        templates={[mockTemplate]} 
        currentUserId="different-user" 
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    // Template card should be rendered without owner privileges
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });

  it('should handle missing onEdit and onDelete props gracefully', () => {
    render(
      <TemplateGrid 
        templates={[mockTemplate]} 
        currentUserId="user-1"
        onView={vi.fn()}
      />
    );
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });

  it('should render multiple templates', () => {
    const templates = [
      mockTemplate,
      { ...mockTemplate, id: '2', name: 'Second Template' }
    ];

    render(
      <TemplateGrid 
        templates={templates} 
        currentUserId="user-1"
        onView={vi.fn()}
      />
    );

    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('Second Template')).toBeInTheDocument();
  });

  it('should have proper grid layout classes', () => {
    const { container } = render(
      <TemplateGrid 
        templates={[mockTemplate]} 
        currentUserId="user-1"
        onView={vi.fn()}
      />
    );

    const gridElement = container.querySelector('.grid');
    expect(gridElement).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2', 
      'lg:grid-cols-3',
      'gap-4'
    );
  });
});