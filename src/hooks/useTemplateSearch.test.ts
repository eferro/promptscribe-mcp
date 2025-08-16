import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTemplateSearch } from './useTemplateSearch';
import { Template } from '@/types/template';

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'React Template',
    description: 'For React components',
    messages: [],
    arguments: [],
    isPublic: false,
    userId: 'user-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Vue Template',
    description: 'For Vue.js applications',
    messages: [],
    arguments: [],
    isPublic: false,
    userId: 'user-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Angular Component',
    description: 'Create Angular components quickly',
    messages: [],
    arguments: [],
    isPublic: false,
    userId: 'user-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

describe('useTemplateSearch', () => {
  it('should return all templates when query is empty', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, ''));
    expect(result.current).toEqual(mockTemplates);
  });

  it('should return all templates when query is whitespace only', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, '   '));
    expect(result.current).toEqual(mockTemplates);
  });

  it('should filter templates by name', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, 'React'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('React Template');
  });

  it('should filter templates by name case-insensitive', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, 'react'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('React Template');
  });

  it('should filter templates by description', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, 'Vue.js'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Vue Template');
  });

  it('should filter templates by description case-insensitive', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, 'VUE.JS'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Vue Template');
  });

  it('should return multiple matches', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, 'component'));
    expect(result.current).toHaveLength(2);
    expect(result.current.map(t => t.name)).toEqual(['React Template', 'Angular Component']);
  });

  it('should return empty array when no matches found', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, 'nonexistent'));
    expect(result.current).toHaveLength(0);
  });

  it('should handle partial matches', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, 'Ang'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Angular Component');
  });

  it('should handle templates without description', () => {
    const templatesWithoutDesc = [
      { ...mockTemplates[0], description: undefined },
      mockTemplates[1]
    ];
    const { result } = renderHook(() => useTemplateSearch(templatesWithoutDesc, 'Vue.js'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Vue Template');
  });
});