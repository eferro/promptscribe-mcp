import { describe, it, expect, expectTypeOf } from 'vitest';
import { TemplateData, TemplateArgument, TemplateMessage, MCPTemplate, Template, validateTemplate } from './template';

describe('Template validation', () => {
  describe('validateTemplate', () => {
    it('should validate required fields', () => {
      expect(validateTemplate({})).toContain('Name is required');
    });
    
    it('should validate name length', () => {
      expect(validateTemplate({ name: 'a'.repeat(101) }))
        .toContain('Name cannot exceed 100 characters');
    });

    it('should require at least one message', () => {
      expect(validateTemplate({ name: 'Valid Name', messages: [] }))
        .toContain('At least one message is required');
    });

    it('should return empty array for valid template', () => {
      const validTemplate: Partial<Template> = {
        name: 'Valid Template',
        messages: [{ role: 'user', content: 'Hello' }]
      };
      expect(validateTemplate(validTemplate)).toEqual([]);
    });

    it('should trim whitespace for name validation', () => {
      expect(validateTemplate({ name: '   ' })).toContain('Name is required');
    });

    it('should return multiple errors for multiple issues', () => {
      const invalidTemplate: Partial<Template> = {
        name: '',
        messages: []
      };
      const errors = validateTemplate(invalidTemplate);
      expect(errors).toContain('Name is required');
      expect(errors).toContain('At least one message is required');
      expect(errors).toHaveLength(2);
    });
  });
});

// Legacy type tests - to be removed after migration
describe('TemplateData type', () => {
  it('has arguments and messages arrays', () => {
    expectTypeOf<TemplateData>().toHaveProperty('arguments').toEqualTypeOf<TemplateArgument[] | undefined>();
    expectTypeOf<TemplateData>().toHaveProperty('messages').toEqualTypeOf<TemplateMessage[] | undefined>();
  });

  it('is used in MCPTemplate', () => {
    expectTypeOf<MCPTemplate>().toHaveProperty('template_data').toEqualTypeOf<TemplateData | null>();
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