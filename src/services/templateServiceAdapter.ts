import { TemplateApplicationService } from '../application/services/TemplateApplicationService';
import { SupabaseTemplateRepository } from '../infrastructure/repositories/SupabaseTemplateRepository';
import { Template } from '../domain/entities/Template';
import { MCPTemplate } from '../types/template';

// Create repository and service instances
const repository = new SupabaseTemplateRepository();
const templateApplicationService = new TemplateApplicationService(repository);

// Helper function to convert Domain Template to MCPTemplate format
function convertToMCPTemplate(template: Template): MCPTemplate {
  return {
    id: template.getId().getValue(),
    name: template.getName().getValue(),
    description: template.getDescription()?.getValue() || null,
    template_data: {
      arguments: template.getArguments(),
      messages: template.getMessages(),
    },
    is_public: template.isPublic(),
    user_id: template.getUserId().getValue(),
    created_at: template.getCreatedAt().toISOString(),
    updated_at: template.getUpdatedAt().toISOString(),
  };
}

// Adapter functions that maintain the original interface
export async function fetchUserTemplates(userId: string) {
  try {
    const templates = await templateApplicationService.getUserTemplates(userId);
    const mcpTemplates = templates.map(convertToMCPTemplate);
    return { data: mcpTemplates, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message || 'Failed to load templates' } };
  }
}

export async function fetchPublicTemplates() {
  try {
    const templates = await templateApplicationService.getPublicTemplates();
    const mcpTemplates = templates.map(convertToMCPTemplate);
    return { data: mcpTemplates, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message || 'Failed to load templates' } };
  }
}

export async function saveTemplate(payload: any, id?: string) {
  try {
    if (id) {
      // Update existing template
      const updateParams = {
        id,
        name: payload.name,
        description: payload.description,
      };
      await templateApplicationService.updateTemplate(updateParams);
    } else {
      // Create new template
      const createParams = {
        name: payload.name,
        description: payload.description,
        messages: payload.template_data?.messages || [],
        arguments_: payload.template_data?.arguments || [],
        userId: payload.user_id,
        isPublic: payload.is_public || false,
      };
      await templateApplicationService.createTemplate(createParams);
    }
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message || 'Failed to save template' } };
  }
}

export async function deleteTemplate(id: string) {
  try {
    await templateApplicationService.deleteTemplate(id);
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message || 'Failed to delete template' } };
  }
}