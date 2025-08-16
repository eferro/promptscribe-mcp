import { TemplateName } from './TemplateName';

describe('TemplateName', () => {
  describe('create', () => {
    it('should create valid template name', () => {
      const name = TemplateName.create('My Template');
      expect(name.getValue()).toBe('My Template');
    });

    it('should trim whitespace', () => {
      const name = TemplateName.create('  My Template  ');
      expect(name.getValue()).toBe('My Template');
    });

    it('should throw for empty name', () => {
      expect(() => TemplateName.create('')).toThrow('Template name cannot be empty');
      expect(() => TemplateName.create('   ')).toThrow('Template name cannot be empty');
    });

    it('should throw for name too long', () => {
      const longName = 'a'.repeat(101);
      expect(() => TemplateName.create(longName)).toThrow('Template name cannot exceed 100 characters');
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const name1 = TemplateName.create('Template');
      const name2 = TemplateName.create('Template');
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different values', () => {
      const name1 = TemplateName.create('Template1');
      const name2 = TemplateName.create('Template2');
      expect(name1.equals(name2)).toBe(false);
    });
  });
});