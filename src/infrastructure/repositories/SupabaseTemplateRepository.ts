import { SupabaseClient } from '@supabase/supabase-js';
import { TemplateRepository } from '../../domain/repositories/TemplateRepository';
import { Template, TemplatePersistenceData } from '../../domain/entities/Template';
import { TemplateId } from '../../domain/valueObjects/TemplateId';
import { UserId } from '../../domain/valueObjects/UserId';
import { Database } from '../../integrations/supabase/types';

type SupabaseTemplateRow = Database['public']['Tables']['prompt_templates']['Row'];

export class SupabaseTemplateRepository implements TemplateRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findById(id: TemplateId): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', id.getValue())
      .single();

    if (error || !data) return null;
    return this.mapToDomain(data);
  }

  async findByUser(userId: UserId): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('user_id', userId.getValue())
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data.map(row => this.mapToDomain(row));
  }

  async findPublic(): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data.map(row => this.mapToDomain(row));
  }

  async save(template: Template): Promise<void> {
    const payload = this.mapToSupabase(template);
    
    const { error } = await this.supabase
      .from('prompt_templates')
      .upsert([payload]);

    if (error) {
      throw new Error(`Failed to save template: ${error.message}`);
    }
  }

  async delete(id: TemplateId): Promise<void> {
    const { error } = await this.supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id.getValue());

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }

  private mapToDomain(row: SupabaseTemplateRow): Template {
    const templateData = row.template_data as any;
    
    const persistenceData: TemplatePersistenceData = {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      isPublic: row.is_public,
      messages: templateData?.messages || [],
      arguments_: templateData?.arguments || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };

    return Template.fromPersistence(persistenceData);
  }

  private mapToSupabase(template: Template): Database['public']['Tables']['prompt_templates']['Insert'] {
    return {
      id: template.getId().getValue(),
      name: template.getName().getValue(),
      description: template.getDescription()?.getValue() || null,
      user_id: template.getUserId().getValue(),
      is_public: template.isPublic(),
      template_data: {
        messages: template.getMessages(),
        arguments: template.getArguments()
      },
      created_at: template.getCreatedAt().toISOString(),
      updated_at: template.getUpdatedAt().toISOString()
    };
  }
}