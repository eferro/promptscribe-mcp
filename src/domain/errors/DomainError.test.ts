import { DomainError, ValidationError, BusinessRuleError } from './DomainError';

describe('DomainError', () => {
  describe('ValidationError', () => {
    it('should create validation error with message', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should include field name when provided', () => {
      const error = new ValidationError('Value too long', 'name');
      
      expect(error.message).toBe('Value too long');
      expect(error.field).toBe('name');
    });
  });

  describe('BusinessRuleError', () => {
    it('should create business rule error with message', () => {
      const error = new BusinessRuleError('Cannot edit template');
      
      expect(error.message).toBe('Cannot edit template');
      expect(error.name).toBe('BusinessRuleError');
      expect(error).toBeInstanceOf(DomainError);
    });

    it('should include rule name when provided', () => {
      const error = new BusinessRuleError('Access denied', 'OwnershipRule');
      
      expect(error.rule).toBe('OwnershipRule');
    });
  });

  describe('DomainError base class', () => {
    it('should be extensible for custom domain errors', () => {
      class CustomDomainError extends DomainError {
        constructor(message: string) {
          super(message);
          this.name = 'CustomDomainError';
        }
      }

      const error = new CustomDomainError('Custom error');
      
      expect(error.name).toBe('CustomDomainError');
      expect(error).toBeInstanceOf(DomainError);
    });
  });
});