import { TemplateRepository } from '../../domain/repositories/TemplateRepository';
import { Template, CreateTemplateParams } from '../../domain/entities/Template';
import { TemplateId } from '../../domain/valueObjects/TemplateId';
import { UserId } from '../../domain/valueObjects/UserId';

export interface UpdateTemplateParams {
  id: string;
  name?: string;
  description?: string | null;
}

export class TemplateApplicationService {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async createTemplate(params: CreateTemplateParams): Promise<Template> {
    const template = Template.create(params);
    await this.templateRepository.save(template);
    return template;
  }

  async getTemplateById(id: string): Promise<Template | null> {
    const templateId = TemplateId.create(id);
    return await this.templateRepository.findById(templateId);
  }

  async getUserTemplates(userId: string): Promise<Template[]> {
    const userIdValue = UserId.create(userId);
    return await this.templateRepository.findByUser(userIdValue);
  }

  async getPublicTemplates(): Promise<Template[]> {
    return await this.templateRepository.findPublic();
  }

  async updateTemplate(params: UpdateTemplateParams): Promise<Template> {
    const templateId = TemplateId.create(params.id);
    const template = await this.templateRepository.findById(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    if (params.name !== undefined) {
      template.updateName(params.name);
    }

    if (params.description !== undefined) {
      template.updateDescription(params.description);
    }

    await this.templateRepository.save(template);
    return template;
  }

  async deleteTemplate(id: string): Promise<void> {
    const templateId = TemplateId.create(id);
    const template = await this.templateRepository.findById(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    await this.templateRepository.delete(templateId);
  }
}