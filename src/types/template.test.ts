import { describe, it, expect, expectTypeOf } from 'vitest';
import { TemplateArgument, TemplateMessage, MCPTemplate, Template, validateNewTemplate, validateTemplateUpdate } from './template';

describe('Template validation', () => {
  describe('validateNewTemplate', () => {
    it('should validate required fields', () => {
      expect(validateNewTemplate({})).toContain('Name is required');
    });

    it('should validate name length', () => {
      expect(validateNewTemplate({ name: 'a'.repeat(101) }))
        .toContain('Name cannot exceed 100 characters');
    });

    it('should require at least one message', () => {
      expect(validateNewTemplate({ name: 'Valid Name', messages: [] }))
        .toContain('At least one message is required');
    });

    it('should return empty array for valid template', () => {
      const validTemplate: Partial<Template> = {
        name: 'Valid Template',
        messages: [{ role: 'user', content: 'Hello' }]
      };
      expect(validateNewTemplate(validTemplate)).toEqual([]);
    });

    it('should trim whitespace for name validation', () => {
      expect(validateNewTemplate({ name: '   ' })).toContain('Name is required');
    });

    it('should return multiple errors for multiple issues', () => {
      const invalidTemplate: Partial<Template> = {
        name: '',
        messages: []
      };
      const errors = validateNewTemplate(invalidTemplate);
      expect(errors).toContain('Name is required');
      expect(errors).toContain('At least one message is required');
      expect(errors).toHaveLength(2);
    });
  });

  describe('validateTemplateUpdate', () => {
    it('should allow partial updates without required fields', () => {
      const partialUpdate = { description: 'New description' };
      expect(validateTemplateUpdate(partialUpdate)).toEqual([]);
    });

    it('should validate name if provided in update', () => {
      const invalidUpdate = { name: '' };
      expect(validateTemplateUpdate(invalidUpdate)).toContain('Name is required');
    });

    it('should validate messages if provided in update', () => {
      const invalidUpdate = { messages: [] };
      expect(validateTemplateUpdate(invalidUpdate)).toContain('At least one message is required');
    });

    it('should accept valid partial updates', () => {
      const validUpdate = { name: 'Updated Name' };
      expect(validateTemplateUpdate(validUpdate)).toEqual([]);
    });
  });
});

// New Template interface type tests
describe('Template interface', () => {
  it('has all required properties with correct types', () => {
    expectTypeOf<Template>().toHaveProperty('id').toEqualTypeOf<string>();
    expectTypeOf<Template>().toHaveProperty('name').toEqualTypeOf<string>();
    expectTypeOf<Template>().toHaveProperty('description').toEqualTypeOf<string | undefined>();
    expectTypeOf<Template>().toHaveProperty('messages').toEqualTypeOf<TemplateMessage[]>();
    expectTypeOf<Template>().toHaveProperty('arguments').toEqualTypeOf<TemplateArgument[]>();
    expectTypeOf<Template>().toHaveProperty('isPublic').toEqualTypeOf<boolean>();
    expectTypeOf<Template>().toHaveProperty('userId').toEqualTypeOf<string>();
    expectTypeOf<Template>().toHaveProperty('createdAt').toEqualTypeOf<string>();
    expectTypeOf<Template>().toHaveProperty('updatedAt').toEqualTypeOf<string>();
  });
});

describe('MCPTemplate type', () => {
  it('has template_data with messages and arguments', () => {
    expectTypeOf<MCPTemplate>().toHaveProperty('template_data').toEqualTypeOf<{
      messages: TemplateMessage[];
      arguments: TemplateArgument[];
    } | null>();
  });
});