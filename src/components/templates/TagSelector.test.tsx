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

  it('should render input field for tag search', () => {
    render(
      <TagSelector 
        selectedTags={mockSelectedTags} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    expect(screen.getByPlaceholderText('Type to search tags...')).toBeInTheDocument();
  });

  it('should show tag count indicator', () => {
    render(
      <TagSelector 
        selectedTags={mockSelectedTags} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    expect(screen.getByText('1/5')).toBeInTheDocument();
  });

  it('should display selected tags as removable badges', () => {
    render(
      <TagSelector 
        selectedTags={mockSelectedTags} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    expect(screen.getByText('write unit test ×')).toBeInTheDocument();
  });

  it('should allow removing tags by clicking on badges', () => {
    render(
      <TagSelector 
        selectedTags={mockSelectedTags} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    fireEvent.click(screen.getByText('write unit test ×'));
    expect(mockOnTagsChange).toHaveBeenCalledWith([]);
  });

  it('should show suggestions when typing', () => {
    render(
      <TagSelector 
        selectedTags={[]} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    const input = screen.getByPlaceholderText('Type to search tags...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Should show suggestions
    expect(screen.getByText('write unit test')).toBeInTheDocument();
    expect(screen.getByText('write integration test')).toBeInTheDocument();
  });

  it('should allow selecting tags from suggestions', () => {
    render(
      <TagSelector 
        selectedTags={[]} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    const input = screen.getByPlaceholderText('Type to search tags...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Click on a suggestion
    fireEvent.click(screen.getByText('write unit test'));
    expect(mockOnTagsChange).toHaveBeenCalledWith(['write-unit-test']);
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
    
    const input = screen.getByPlaceholderText('Maximum tags reached');
    expect(input).toBeDisabled();
  });

  it('should show help text when at max tags', () => {
    const maxTags = 1;
    const selectedTags: TaskTag[] = ['write-unit-test'];
    
    render(
      <TagSelector 
        selectedTags={selectedTags} 
        onTagsChange={mockOnTagsChange}
        maxTags={maxTags}
      />
    );
    
    expect(screen.getByText('Maximum tags reached. Remove some tags to add new ones.')).toBeInTheDocument();
  });

  it('should show help text for normal operation', () => {
    render(
      <TagSelector 
        selectedTags={[]} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    expect(screen.getByText('Type to search and select tags. Press Enter to select the first suggestion.')).toBeInTheDocument();
  });

  it('should handle Enter key to select first suggestion', () => {
    render(
      <TagSelector 
        selectedTags={[]} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    const input = screen.getByPlaceholderText('Type to search tags...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnTagsChange).toHaveBeenCalledWith(['write-unit-test']);
  });

  it('should handle Escape key to close suggestions', () => {
    render(
      <TagSelector 
        selectedTags={[]} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    const input = screen.getByPlaceholderText('Type to search tags...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Press Escape
    fireEvent.keyDown(input, { key: 'Escape' });
    
    // Suggestions should be hidden
    expect(screen.queryByText('write unit test')).not.toBeInTheDocument();
  });

  it('should filter out already selected tags from suggestions', () => {
    render(
      <TagSelector 
        selectedTags={['write-unit-test']} 
        onTagsChange={mockOnTagsChange} 
      />
    );
    
    const input = screen.getByPlaceholderText('Type to search tags...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Should not show already selected tag
    expect(screen.queryByText('write unit test')).not.toBeInTheDocument();
    // Should show other test-related tags
    expect(screen.getByText('write integration test')).toBeInTheDocument();
  });
});