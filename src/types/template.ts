import { TaskTag } from './tags';

export interface TemplateMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TemplateArgument {
  name: string;
  description: string;
  required: boolean;
  type?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  messages: TemplateMessage[];
  arguments: TemplateArgument[];
  isPublic: boolean;
  userId: string;
  createdByUsername?: string;
  createdAt: string;
  updatedAt: string;
  tags?: TaskTag[];
}

// Legacy interface for database mapping - will be removed in next phase
export interface TemplateData {
  arguments?: TemplateArgument[];
  messages?: TemplateMessage[];
}

export interface MCPTemplate {
  id: string;
  name: string;
  description: string | null;
  template_data: TemplateData | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  tags: string[] | null;
}

// Simple validation function
export function validateTemplate(template: Partial<Template>, isUpdate = false): string[] {
  const errors: string[] = [];
  
  if (isUpdate) {
    // For updates, only validate fields that are being set
    if ('name' in template) {
      if (!template.name?.trim()) {
        errors.push('Name is required');
      }
      
      if (template.name && template.name.length > 100) {
        errors.push('Name cannot exceed 100 characters');
      }
    }
    
    if ('messages' in template) {
      if (!template.messages || template.messages.length === 0) {
        errors.push('At least one message is required');
      }
    }
    
    if ('tags' in template) {
      if (template.tags && template.tags.length > 5) {
        errors.push('Maximum 5 tags allowed per template');
      }
    }
  } else {
    // For create operations, validate all required fields
    if (!template.name?.trim()) {
      errors.push('Name is required');
    }
    
    if (template.name && template.name.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }
    
    if (!template.messages || template.messages.length === 0) {
      errors.push('At least one message is required');
    }
    
    if (template.tags && template.tags.length > 5) {
      errors.push('Maximum 5 tags allowed per template');
    }
  }
  
  return errors;
}