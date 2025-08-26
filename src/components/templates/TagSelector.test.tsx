import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TagSelector } from './TagSelector';
import { TaskTag } from '@/types/tags';

describe('TagSelector', () => {
  const mockSelectedTags: TaskTag[] = ['write-unit-test'];
  const mockOnTagsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all tag categories', () => {
    render(
      <TagSelector 
        selectedTags={mockSelectedTags} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    expect(screen.getByText('Testing')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('Refactoring')).toBeInTheDocument();
    expect(screen.getByText('Agile')).toBeInTheDocument();
    expect(screen.getByText('Lean')).toBeInTheDocument();
  });

  it('should allow selecting tags up to maximum limit', () => {
    render(
      <TagSelector 
        selectedTags={mockSelectedTags} 
        onTagsChange={mockOnTagsChange}
        maxTags={3}
      />
    );
    
    // Click on a new tag
    fireEvent.click(screen.getByText('write integration test'));
    expect(mockOnTagsChange).toHaveBeenCalledWith([
      'write-unit-test', 
      'write-integration-test'
    ]);
  });

  it('should prevent selecting more than max tags', () => {
    const maxTags = 2;
    const selectedTags: TaskTag[] = ['write-unit-test', 'write-integration-test'];
    
    render(
      <TagSelector 
        selectedTags={selectedTags} 
        onTagsChange={mockOnTagsChange}
        maxTags={maxTags}
      />
    );
    
    // Try to select another tag
    const newTagButton = screen.getByText('fix failing test');
    expect(newTagButton).toBeDisabled();
  });

  it('should display selected tags correctly', () => {
    render(
      <TagSelector 
        selectedTags={mockSelectedTags} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    expect(screen.getByText('write unit test ×')).toBeInTheDocument();
  });

  it('should handle tag deselection', () => {
    render(
      <TagSelector 
        selectedTags={mockSelectedTags} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    // Click on selected tag to deselect
    fireEvent.click(screen.getByText('write unit test ×'));
    expect(mockOnTagsChange).toHaveBeenCalledWith([]);
  });

  it('should show selected tags count', () => {
    render(
      <TagSelector 
        selectedTags={mockSelectedTags} 
        onTagsChange={mockOnTagsChange}
        maxTags={5}
      />
    );
    
    expect(screen.getByText('Selected Tags (1/5)')).toBeInTheDocument();
  });

  it('should format tag names correctly', () => {
    render(
      <TagSelector 
        selectedTags={[]} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    // Check that tag names are formatted from kebab-case to readable format
    expect(screen.getByText('write unit test')).toBeInTheDocument();
    expect(screen.getByText('write integration test')).toBeInTheDocument();
  });
});