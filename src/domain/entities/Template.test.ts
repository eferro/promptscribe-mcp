import { Template } from './Template';
import { TemplateId } from '../valueObjects/TemplateId';
import { TemplateName } from '../valueObjects/TemplateName';
import { UserId } from '../valueObjects/UserId';

describe('Template', () => {
  const validParams = {
    name: 'Test Template',
    description: 'Test description',
    messages: [{ role: 'user' as const, content: 'Hello' }],
    arguments_: [],
    userId: '123e4567-e89b-12d3-a456-426614174000',
    isPublic: false
  };

  describe('create', () => {
    it('should create template with valid data', () => {
      const template = Template.create(validParams);
      
      expect(template.getName().getValue()).toBe('Test Template');
      expect(template.getDescription()?.getValue()).toBe('Test description');
      expect(template.isPublic()).toBe(false);
      expect(template.getMessages()).toHaveLength(1);
    });

    it('should throw if no messages provided', () => {
      const params = { ...validParams, messages: [] };
      expect(() => Template.create(params)).toThrow('Template must have at least one message');
    });

    it('should generate unique ID', () => {
      const template1 = Template.create(validParams);
      const template2 = Template.create(validParams);
      expect(template1.getId().equals(template2.getId())).toBe(false);
    });

    it('should set creation timestamps', () => {
      const before = new Date();
      const template = Template.create(validParams);
      const after = new Date();
      
      expect(template.getCreatedAt().getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(template.getCreatedAt().getTime()).toBeLessThanOrEqual(after.getTime());
      expect(template.getUpdatedAt().getTime()).toBe(template.getCreatedAt().getTime());
    });
  });

  describe('updateName', () => {
    it('should update name and timestamp', async () => {
      const template = Template.create(validParams);
      const originalUpdatedAt = template.getUpdatedAt();
      
      // Wait to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));
      
      template.updateName('New Name');
      
      expect(template.getName().getValue()).toBe('New Name');
      expect(template.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should validate new name', () => {
      const template = Template.create(validParams);
      expect(() => template.updateName('')).toThrow('Template name cannot be empty');
    });
  });

  describe('isOwnedBy', () => {
    it('should return true for owner', () => {
      const template = Template.create(validParams);
      const userId = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      expect(template.isOwnedBy(userId)).toBe(true);
    });

    it('should return false for non-owner', () => {
      const template = Template.create(validParams);
      const userId = UserId.create('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(template.isOwnedBy(userId)).toBe(false);
    });
  });

  describe('canBeEditedBy', () => {
    it('should allow owner to edit', () => {
      const template = Template.create(validParams);
      const userId = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      expect(template.canBeEditedBy(userId)).toBe(true);
    });

    it('should not allow non-owner to edit', () => {
      const template = Template.create(validParams);
      const userId = UserId.create('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(template.canBeEditedBy(userId)).toBe(false);
    });
  });
});