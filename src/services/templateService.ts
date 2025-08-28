import { SupabaseClient } from '@supabase/supabase-js';
import { Template, validateTemplate } from '../types/template';
import { TaskTag } from '../types/tags';

// Database row type for template data
interface TemplateDbRow {
  id: string;
  name: string;
  description: string | null;
  template_data: {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    arguments: Array<{ name: string; description: string; required: boolean; type?: string }>;
  } | null;
  is_public: boolean;
  user_id: string;
  created_by_username: string | null;
  created_at: string;
  updated_at: string;
  tags: string[] | null;
}

// Update payload type for database
interface TemplateUpdatePayload {
  updated_at: string;
  name?: string;
  description?: string | null;
  is_public?: boolean;
  tags?: string[] | null;
  template_data?: {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    arguments: Array<{ name: string; description: string; required: boolean; type?: string }>;
  };
}

export class TemplateService {
  constructor(private supabase: SupabaseClient) {}

  async create(templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
    // Validate first
    const errors = validateTemplate(templateData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const payload = {
      name: templateData.name,
      description: templateData.description || null,
      template_data: {
        messages: templateData.messages,
        arguments: templateData.arguments
      },
      user_id: templateData.userId,
      is_public: templateData.isPublic,
      tags: templateData.tags || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
      // Note: created_by_username will be automatically populated by database trigger
    };

    const { data, error } = await this.supabase
      .from('prompt_templates')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(`Failed to create template: ${error.message}`);
    
    return this.mapFromDb(data);
  }

  async findByUser(userId: string): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
    
    return data.map(row => this.mapFromDb(row));
  }

  async findPublic(): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch public templates: ${error.message}`);
    
    return data.map(row => this.mapFromDb(row));
  }

  async findById(id: string): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch template: ${error.message}`);
    }

    return this.mapFromDb(data);
  }

  async update(id: string, updates: Partial<Template>): Promise<Template> {
    // Validate updates
    const errors = validateTemplate(updates, true);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const payload: TemplateUpdatePayload = {
      updated_at: new Date().toISOString()
    };

    // Only include fields that are being updated
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description || null;
    if (updates.isPublic !== undefined) payload.is_public = updates.isPublic;
    if (updates.tags !== undefined) payload.tags = updates.tags || null;
      if (updates.messages !== undefined || updates.arguments !== undefined) {
        payload.template_data = {
          messages: updates.messages ?? [],
          arguments: updates.arguments ?? []
        };
      }

    const { data, error } = await this.supabase
      .from('prompt_templates')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update template: ${error.message}`);
    
    return this.mapFromDb(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete template: ${error.message}`);
  }

  // New method for tag-based search
  async findByTags(tags: TaskTag[]): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .overlaps('tags', tags);
      
    if (error) throw new Error(`Failed to search templates by tags: ${error.message}`);
    return data.map(row => this.mapFromDb(row));
  }

  private mapFromDb(row: TemplateDbRow): Template {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      messages: row.template_data?.messages || [],
      arguments: row.template_data?.arguments || [],
      isPublic: row.is_public,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tags: row.tags ? row.tags as TaskTag[] : undefined
    };
  }
}