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

  describe('fromPersistence', () => {
    it('should reconstruct template from persistence data', () => {
      const persistenceData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Persisted Template',
        description: 'Persisted description',
        userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        isPublic: true,
        messages: [{ role: 'user' as const, content: 'Persisted message' }],
        arguments_: [{ name: 'arg1', description: 'Argument 1', required: true }],
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z')
      };

      const template = Template.fromPersistence(persistenceData);

      expect(template.getId().getValue()).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(template.getName().getValue()).toBe('Persisted Template');
      expect(template.getDescription()?.getValue()).toBe('Persisted description');
      expect(template.getUserId().getValue()).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(template.isPublic()).toBe(true);
      expect(template.getMessages()).toHaveLength(1);
      expect(template.getArguments()).toHaveLength(1);
      expect(template.getCreatedAt()).toEqual(new Date('2023-01-01T00:00:00Z'));
      expect(template.getUpdatedAt()).toEqual(new Date('2023-01-02T00:00:00Z'));
    });

    it('should handle null description in persistence data', () => {
      const persistenceData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Template Without Description',
        description: null,
        userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        isPublic: false,
        messages: [{ role: 'user' as const, content: 'Message' }],
        arguments_: [],
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      };

      const template = Template.fromPersistence(persistenceData);

      expect(template.getDescription()).toBeNull();
    });
  });
});