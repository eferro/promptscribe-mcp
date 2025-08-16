import { TemplateDescription } from './TemplateDescription';

describe('TemplateDescription', () => {
  describe('create', () => {
    it('should create valid template description', () => {
      const description = TemplateDescription.create('A useful template');
      expect(description.getValue()).toBe('A useful template');
    });

    it('should trim whitespace', () => {
      const description = TemplateDescription.create('  A useful template  ');
      expect(description.getValue()).toBe('A useful template');
    });

    it('should allow null for empty description', () => {
      const description = TemplateDescription.create('');
      expect(description).toBeNull();
    });

    it('should allow null for whitespace-only description', () => {
      const description = TemplateDescription.create('   ');
      expect(description).toBeNull();
    });

    it('should throw for description too long', () => {
      const longDescription = 'a'.repeat(501);
      expect(() => TemplateDescription.create(longDescription)).toThrow('Template description cannot exceed 500 characters');
    });

    it('should allow description at max length', () => {
      const maxDescription = 'a'.repeat(500);
      const description = TemplateDescription.create(maxDescription);
      expect(description?.getValue()).toBe(maxDescription);
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const desc1 = TemplateDescription.create('Description');
      const desc2 = TemplateDescription.create('Description');
      expect(desc1?.equals(desc2!)).toBe(true);
    });

    it('should return false for different values', () => {
      const desc1 = TemplateDescription.create('Description1');
      const desc2 = TemplateDescription.create('Description2');
      expect(desc1?.equals(desc2!)).toBe(false);
    });

    it('should handle null values separately', () => {
      const desc1 = TemplateDescription.create('Description');
      const desc2 = TemplateDescription.create('');
      expect(desc1).not.toBeNull();
      expect(desc2).toBeNull();
    });
  });
});