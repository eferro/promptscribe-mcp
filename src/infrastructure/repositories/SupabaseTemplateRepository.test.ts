import { SupabaseTemplateRepository } from './SupabaseTemplateRepository';
import { Template } from '../../domain/entities/Template';
import { TemplateId } from '../../domain/valueObjects/TemplateId';
import { UserId } from '../../domain/valueObjects/UserId';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../integrations/supabase/types';
import { vi } from 'vitest';

describe('SupabaseTemplateRepository', () => {
  let mockSupabase: any;
  let repository: SupabaseTemplateRepository;

  beforeEach(() => {
    // Create a mock Supabase client with fluent interface
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    };

    mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };

    repository = new SupabaseTemplateRepository(mockSupabase);
  });

  describe('findById', () => {
    it('should return template when found', async () => {
      const templateId = TemplateId.create('123e4567-e89b-12d3-a456-426614174000');
      const mockRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Template',
        description: 'Test description',
        user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        is_public: false,
        template_data: {
          messages: [{ role: 'user', content: 'Hello' }],
          arguments: []
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      mockSupabase.from().single.mockResolvedValue({
        data: mockRow,
        error: null
      });

      const result = await repository.findById(templateId);

      expect(result).not.toBeNull();
      expect(result!.getName().getValue()).toBe('Test Template');
      expect(mockSupabase.from).toHaveBeenCalledWith('prompt_templates');
    });

    it('should return null when template not found', async () => {
      const templateId = TemplateId.create('123e4567-e89b-12d3-a456-426614174000');

      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      });

      const result = await repository.findById(templateId);

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save template to supabase', async () => {
      const template = Template.create({
        name: 'Test Template',
        description: 'Test description',
        messages: [{ role: 'user', content: 'Hello' }],
        arguments_: [],
        userId: '123e4567-e89b-12d3-a456-426614174000',
        isPublic: true
      });

      mockSupabase.from().upsert.mockResolvedValue({
        data: null,
        error: null
      });

      await repository.save(template);

      expect(mockSupabase.from().upsert).toHaveBeenCalledWith([
        expect.objectContaining({
          id: template.getId().getValue(),
          name: 'Test Template',
          description: 'Test description',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          is_public: true,
          template_data: {
            messages: [{ role: 'user', content: 'Hello' }],
            arguments: []
          }
        })
      ]);
    });

    it('should throw error when save fails', async () => {
      const template = Template.create({
        name: 'Test Template',
        messages: [{ role: 'user', content: 'Hello' }],
        arguments_: [],
        userId: '123e4567-e89b-12d3-a456-426614174000',
        isPublic: false
      });

      mockSupabase.from().upsert.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(repository.save(template)).rejects.toThrow('Failed to save template: Database error');
    });
  });

  describe('findByUser', () => {
    it('should return templates for user', async () => {
      const userId = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      const mockRows = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Template 1',
          description: null,
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          is_public: false,
          template_data: {
            messages: [{ role: 'user', content: 'Hello 1' }],
            arguments: []
          },
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ];

      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().order.mockResolvedValue({
        data: mockRows,
        error: null
      });

      const result = await repository.findByUser(userId);

      expect(result).toHaveLength(1);
      expect(result[0].getName().getValue()).toBe('Template 1');
    });
  });

  describe('delete', () => {
    it('should delete template', async () => {
      const templateId = TemplateId.create('123e4567-e89b-12d3-a456-426614174000');

      // Mock the fluent interface for delete
      mockSupabase.from().delete.mockReturnThis();
      mockSupabase.from().eq.mockResolvedValue({
        data: null,
        error: null
      });

      await repository.delete(templateId);

      expect(mockSupabase.from().delete).toHaveBeenCalled();
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', templateId.getValue());
    });

    it('should throw error when delete fails', async () => {
      const templateId = TemplateId.create('123e4567-e89b-12d3-a456-426614174000');

      // Mock the fluent interface for delete
      mockSupabase.from().delete.mockReturnThis();
      mockSupabase.from().eq.mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' }
      });

      await expect(repository.delete(templateId)).rejects.toThrow('Failed to delete template: Delete failed');
    });
  });
});