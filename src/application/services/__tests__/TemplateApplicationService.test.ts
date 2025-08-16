import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TemplateApplicationService } from '../TemplateApplicationService';
import { TemplateRepository } from '../../../domain/repositories/TemplateRepository';
import { Template, TemplateMessage, TemplateArgument } from '../../../domain/entities/Template';
import { TemplateId } from '../../../domain/valueObjects/TemplateId';
import { UserId } from '../../../domain/valueObjects/UserId';

const mockRepository: TemplateRepository = {
  findById: vi.fn(),
  findByUser: vi.fn(),
  findPublic: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

describe('TemplateApplicationService', () => {
  let service: TemplateApplicationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TemplateApplicationService(mockRepository);
  });

  describe('createTemplate', () => {
    it('should create and save a new template', async () => {
      const createParams = {
        name: 'Test Template',
        description: 'A test template',
        messages: [{ role: 'user' as const, content: 'Hello' }] as TemplateMessage[],
        arguments_: [] as TemplateArgument[],
        userId: '123e4567-e89b-12d3-a456-426614174000',
        isPublic: false,
      };

      const savedTemplate = await service.createTemplate(createParams);

      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Template));
      expect(savedTemplate.getName().getValue()).toBe('Test Template');
      expect(savedTemplate.getDescription()?.getValue()).toBe('A test template');
      expect(savedTemplate.getUserId().getValue()).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(savedTemplate.isPublic()).toBe(false);
    });
  });

  describe('getTemplateById', () => {
    it('should return template when found', async () => {
      const templateId = '123e4567-e89b-12d3-a456-426614174001';
      const mockTemplate = Template.create({
        name: 'Found Template',
        messages: [{ role: 'user' as const, content: 'Test' }],
        arguments_: [],
        userId: '123e4567-e89b-12d3-a456-426614174000',
        isPublic: true,
      });

      (mockRepository.findById as any).mockResolvedValue(mockTemplate);

      const result = await service.getTemplateById(templateId);

      expect(mockRepository.findById).toHaveBeenCalledWith(TemplateId.create(templateId));
      expect(result).toBe(mockTemplate);
    });
  });

  describe('getUserTemplates', () => {
    it('should return templates for a specific user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockTemplates = [
        Template.create({
          name: 'User Template 1',
          messages: [{ role: 'user' as const, content: 'Test 1' }],
          arguments_: [],
          userId,
          isPublic: false,
        }),
        Template.create({
          name: 'User Template 2',
          messages: [{ role: 'user' as const, content: 'Test 2' }],
          arguments_: [],
          userId,
          isPublic: true,
        }),
      ];

      (mockRepository.findByUser as any).mockResolvedValue(mockTemplates);

      const result = await service.getUserTemplates(userId);

      expect(mockRepository.findByUser).toHaveBeenCalledWith(UserId.create(userId));
      expect(result).toBe(mockTemplates);
      expect(result).toHaveLength(2);
    });
  });

  describe('getPublicTemplates', () => {
    it('should return all public templates', async () => {
      const mockPublicTemplates = [
        Template.create({
          name: 'Public Template 1',
          messages: [{ role: 'user' as const, content: 'Public Test 1' }],
          arguments_: [],
          userId: '123e4567-e89b-12d3-a456-426614174000',
          isPublic: true,
        }),
        Template.create({
          name: 'Public Template 2',
          messages: [{ role: 'user' as const, content: 'Public Test 2' }],
          arguments_: [],
          userId: '123e4567-e89b-12d3-a456-426614174001',
          isPublic: true,
        }),
      ];

      (mockRepository.findPublic as any).mockResolvedValue(mockPublicTemplates);

      const result = await service.getPublicTemplates();

      expect(mockRepository.findPublic).toHaveBeenCalledWith();
      expect(result).toBe(mockPublicTemplates);
      expect(result).toHaveLength(2);
    });
  });

  describe('updateTemplate', () => {
    it('should update template name and save it', async () => {
      const templateId = '123e4567-e89b-12d3-a456-426614174001';
      const mockTemplate = Template.create({
        name: 'Original Name',
        messages: [{ role: 'user' as const, content: 'Test' }],
        arguments_: [],
        userId: '123e4567-e89b-12d3-a456-426614174000',
        isPublic: false,
      });

      (mockRepository.findById as any).mockResolvedValue(mockTemplate);

      const updateParams = {
        id: templateId,
        name: 'Updated Name',
      };

      const result = await service.updateTemplate(updateParams);

      expect(mockRepository.findById).toHaveBeenCalledWith(TemplateId.create(templateId));
      expect(mockRepository.save).toHaveBeenCalledWith(mockTemplate);
      expect(result.getName().getValue()).toBe('Updated Name');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete an existing template', async () => {
      const templateId = '123e4567-e89b-12d3-a456-426614174001';
      const mockTemplate = Template.create({
        name: 'Template to Delete',
        messages: [{ role: 'user' as const, content: 'Test' }],
        arguments_: [],
        userId: '123e4567-e89b-12d3-a456-426614174000',
        isPublic: false,
      });

      (mockRepository.findById as any).mockResolvedValue(mockTemplate);

      await service.deleteTemplate(templateId);

      expect(mockRepository.findById).toHaveBeenCalledWith(TemplateId.create(templateId));
      expect(mockRepository.delete).toHaveBeenCalledWith(TemplateId.create(templateId));
    });
  });
});