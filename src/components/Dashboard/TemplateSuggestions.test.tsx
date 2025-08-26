import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TemplateSuggestions } from './TemplateSuggestions';
import { Template } from '@/types/template';

describe('TemplateSuggestions', () => {
  const mockOnView = vi.fn();

  const mockCurrentTemplate: Template = {
    id: 'current-template',
    name: 'Current Template',
    description: 'Current template description',
    messages: [],
    arguments: [],
    isPublic: true,
    userId: 'user-1',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    tags: ['write-unit-test', 'refactor-test-code']
  };

  const mockRelatedTemplate1: Template = {
    id: 'related-1',
    name: 'Related Template 1',
    description: 'Related template 1 description',
    messages: [],
    arguments: [],
    isPublic: true,
    userId: 'user-2',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    tags: ['write-unit-test', 'improve-test-coverage']
  };

  const mockRelatedTemplate2: Template = {
    id: 'related-2',
    name: 'Related Template 2',
    description: 'Related template 2 description',
    messages: [],
    arguments: [],
    isPublic: true,
    userId: 'user-3',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    tags: ['refactor-test-code', 'mock-dependencies']
  };

  const mockUnrelatedTemplate: Template = {
    id: 'unrelated',
    name: 'Unrelated Template',
    description: 'Unrelated template description',
    messages: [],
    arguments: [],
    isPublic: true,
    userId: 'user-4',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    tags: ['eliminate-waste', 'build-integrity']
  };

  const allTemplates = [mockCurrentTemplate, mockRelatedTemplate1, mockRelatedTemplate2, mockUnrelatedTemplate];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render related templates based on matching tags', () => {
    render(
      <TemplateSuggestions
        currentTemplate={mockCurrentTemplate}
        allTemplates={allTemplates}
        onView={mockOnView}
      />
    );

    expect(screen.getByText('Related Templates')).toBeInTheDocument();
    expect(screen.getByText('Related Template 1')).toBeInTheDocument();
    expect(screen.getByText('Related Template 2')).toBeInTheDocument();
    expect(screen.queryByText('Unrelated Template')).not.toBeInTheDocument();
  });

  it('should not render current template in suggestions', () => {
    render(
      <TemplateSuggestions
        currentTemplate={mockCurrentTemplate}
        allTemplates={allTemplates}
        onView={mockOnView}
      />
    );

    expect(screen.queryByText('Current Template')).not.toBeInTheDocument();
  });

  it('should render nothing when no related templates exist', () => {
    const templateWithNoRelated: Template = {
      ...mockCurrentTemplate,
      tags: ['unique-tag-that-no-one-has']
    };

    const { container } = render(
      <TemplateSuggestions
        currentTemplate={templateWithNoRelated}
        allTemplates={allTemplates}
        onView={mockOnView}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when current template has no tags', () => {
    const templateWithNoTags: Template = {
      ...mockCurrentTemplate,
      tags: undefined
    };

    const { container } = render(
      <TemplateSuggestions
        currentTemplate={templateWithNoTags}
        allTemplates={allTemplates}
        onView={mockOnView}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display template tags with proper formatting', () => {
    render(
      <TemplateSuggestions
        currentTemplate={mockCurrentTemplate}
        allTemplates={allTemplates}
        onView={mockOnView}
      />
    );

    expect(screen.getByText('write unit test')).toBeInTheDocument();
    expect(screen.getByText('improve test coverage')).toBeInTheDocument();
  });

  it('should handle template view button clicks', () => {
    render(
      <TemplateSuggestions
        currentTemplate={mockCurrentTemplate}
        allTemplates={allTemplates}
        onView={mockOnView}
      />
    );

    const viewButtons = screen.getAllByText('View Template');
    fireEvent.click(viewButtons[0]);
    
    expect(mockOnView).toHaveBeenCalledWith(mockRelatedTemplate1);
  });

  it('should limit displayed tags to 3 and show count for additional tags', () => {
    const templateWithManyTags: Template = {
      ...mockRelatedTemplate1,
      tags: ['write-unit-test', 'tag2', 'tag3', 'tag4', 'tag5'] // Shares 'write-unit-test' with current template
    };

    render(
      <TemplateSuggestions
        currentTemplate={mockCurrentTemplate}
        allTemplates={[mockCurrentTemplate, templateWithManyTags]}
        onView={mockOnView}
      />
    );

    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });
});