import { useMemo } from 'react';
import { Template } from '@/types/template';

export function useTemplateSearch(templates: Template[], query: string) {
  return useMemo(() => {
    if (!query.trim()) return templates;
    
    const lowercaseQuery = query.toLowerCase();
    return templates.filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      (template.description && template.description.toLowerCase().includes(lowercaseQuery))
    );
  }, [templates, query]);
}