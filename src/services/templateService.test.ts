import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TemplateService } from './templateService';

// Mock Supabase client type for testing
interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
}

describe('TemplateService', () => {
  let service: TemplateService;
  let mockSupabase: MockSupabaseClient;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };
    service = new TemplateService(mockSupabase);
  });

  describe('create', () => {
    it('should create valid template', async () => {
      const template = {
        name: 'Test Template',
        description: 'Test description',
        messages: [{ role: 'user' as const, content: 'Hello' }],
        arguments: [],
        userId: 'user-123',
        isPublic: false
      };

      const mockResponse = {
        id: 'new-id',
        name: 'Test Template',
        description: 'Test description',
        template_data: {
          messages: [{ role: 'user', content: 'Hello' }],
          arguments: []
        },
        user_id: 'user-123',
        created_by_username: 'testuser',
        is_public: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockResponse, error: null })
          })
        })
      });

      const result = await service.create(template);
      
      expect(result.id).toBe('new-id');
      expect(result.name).toBe('Test Template');
      expect(result.messages).toEqual([{ role: 'user', content: 'Hello' }]);
    });

    it('should validate template before creating', async () => {
      const template = { 
        name: '', 
        messages: [], 
        arguments: [], 
        userId: 'user-123', 
        isPublic: false 
      };
      
      await expect(service.create(template))
        .rejects.toThrow('Name is required');
    });

    it('should throw for name too long', async () => {
      const template = { 
        name: 'a'.repeat(101), 
        messages: [{ role: 'user' as const, content: 'Hello' }], 
        arguments: [], 
        userId: 'user-123', 
        isPublic: false 
      };
      
      await expect(service.create(template))
        .rejects.toThrow('Name cannot exceed 100 characters');
    });

    it('should require at least one message', async () => {
      const template = { 
        name: 'Valid Name', 
        messages: [], 
        arguments: [], 
        userId: 'user-123', 
        isPublic: false 
      };
      
      await expect(service.create(template))
        .rejects.toThrow('At least one message is required');
    });

    it('should handle supabase errors', async () => {
      const template = {
        name: 'Test Template',
        messages: [{ role: 'user' as const, content: 'Hello' }],
        arguments: [],
        userId: 'user-123',
        isPublic: false
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Database error' } 
            })
          })
        })
      });

      await expect(service.create(template))
        .rejects.toThrow('Failed to create template: Database error');
    });
  });

  describe('findByUser', () => {
    it('should return user templates', async () => {
      const mockData = [{
        id: '1',
        name: 'Template 1',
        description: 'Description 1',
        template_data: {
          messages: [{ role: 'user', content: 'Hello 1' }],
          arguments: []
        },
        user_id: 'user-123',
        is_public: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null })
      });

      const result = await service.findByUser('user-123');
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].name).toBe('Template 1');
    });

    it('should handle supabase errors in findByUser', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Fetch error' } 
        })
      });

      await expect(service.findByUser('user-123'))
        .rejects.toThrow('Failed to fetch templates: Fetch error');
    });
  });

  describe('findPublic', () => {
    it('should return public templates', async () => {
      const mockData = [{
        id: '2',
        name: 'Public Template',
        description: 'Public description',
        template_data: {
          messages: [{ role: 'user', content: 'Public hello' }],
          arguments: []
        },
        user_id: 'user-456',
        is_public: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null })
      });

      const result = await service.findPublic();
      
      expect(result).toHaveLength(1);
      expect(result[0].isPublic).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return template by id', async () => {
      const mockData = {
        id: 'template-123',
        name: 'Found Template',
        description: 'Found description',
        template_data: {
          messages: [{ role: 'user', content: 'Found hello' }],
          arguments: []
        },
        user_id: 'user-789',
        is_public: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockData, error: null })
      });

      const result = await service.findById('template-123');
      
      expect(result).not.toBeNull();
      expect(result!.id).toBe('template-123');
      expect(result!.name).toBe('Found Template');
    });

    it('should return null for non-existent template', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116' } 
        })
      });

      const result = await service.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update template successfully', async () => {
      const updates = {
        name: 'Updated Template',
        description: 'Updated description'
      };

      const mockResponse = {
        id: 'template-123',
        name: 'Updated Template',
        description: 'Updated description',
        template_data: {
          messages: [{ role: 'user', content: 'Hello' }],
          arguments: []
        },
        user_id: 'user-123',
        is_public: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T01:00:00Z'
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockResponse, error: null })
            })
          })
        })
      });

      const result = await service.update('template-123', updates);
      
      expect(result.name).toBe('Updated Template');
      expect(result.description).toBe('Updated description');
    });

    it('should validate updates before saving', async () => {
      const updates = { name: '' };
      
      await expect(service.update('template-123', updates))
        .rejects.toThrow('Name is required');
    });
  });

  describe('delete', () => {
    it('should delete template successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      });

      await expect(service.delete('template-123')).resolves.not.toThrow();
    });

    it('should handle delete errors', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
        })
      });

      await expect(service.delete('template-123'))
        .rejects.toThrow('Failed to delete template: Delete failed');
    });
  });
});