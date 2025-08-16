import { TemplateId } from './TemplateId';

describe('TemplateId', () => {
  describe('create', () => {
    it('should create valid template id with uuid', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const templateId = TemplateId.create(validUuid);
      expect(templateId.getValue()).toBe(validUuid);
    });

    it('should throw for invalid uuid format', () => {
      expect(() => TemplateId.create('invalid-uuid')).toThrow('Invalid template ID format');
      expect(() => TemplateId.create('')).toThrow('Invalid template ID format');
      expect(() => TemplateId.create('123')).toThrow('Invalid template ID format');
    });

    it('should accept various valid uuid formats', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '00000000-0000-0000-0000-000000000000'
      ];

      validUuids.forEach(uuid => {
        expect(() => TemplateId.create(uuid)).not.toThrow();
        expect(TemplateId.create(uuid).getValue()).toBe(uuid);
      });
    });
  });

  describe('generate', () => {
    it('should generate valid template ids', () => {
      const templateId = TemplateId.generate();
      expect(templateId.getValue()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique template ids', () => {
      const id1 = TemplateId.generate();
      const id2 = TemplateId.generate();
      expect(id1.getValue()).not.toBe(id2.getValue());
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const id1 = TemplateId.create(uuid);
      const id2 = TemplateId.create(uuid);
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different values', () => {
      const id1 = TemplateId.create('123e4567-e89b-12d3-a456-426614174000');
      const id2 = TemplateId.create('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(id1.equals(id2)).toBe(false);
    });
  });
});