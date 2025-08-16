// Temporary adapter to map between old domain entities and new simple interfaces
// This will be removed once all services are migrated

import { Template } from './template';

// Legacy imports will be replaced gradually
export interface CreateTemplateParams {
  name: string;
  description?: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  arguments_: Array<{
    name: string;
    description: string;
    required: boolean;
    type?: string;
  }>;
  userId: string;
  isPublic: boolean;
}

export interface TemplatePersistenceData {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  isPublic: boolean;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  arguments_: Array<{
    name: string;
    description: string;
    required: boolean;
    type?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Adapter functions to convert between old and new formats
export function createTemplateFromParams(params: CreateTemplateParams): Omit<Template, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: params.name,
    description: params.description,
    messages: params.messages,
    arguments: params.arguments_, // Note: converting arguments_ to arguments
    userId: params.userId,
    isPublic: params.isPublic
  };
}

export function convertPersistenceToTemplate(data: TemplatePersistenceData): Template {
  return {
    id: data.id,
    name: data.name,
    description: data.description || undefined,
    messages: data.messages,
    arguments: data.arguments_,
    userId: data.userId,
    isPublic: data.isPublic,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString()
  };
}