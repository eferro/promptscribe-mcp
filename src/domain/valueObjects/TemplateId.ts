import { ValidationError } from '../errors/DomainError';

export class TemplateId {
  private constructor(private readonly value: string) {}

  static create(value: string): TemplateId {
    if (!this.isValidUuid(value)) {
      throw new ValidationError('Invalid template ID format', 'id');
    }
    
    return new TemplateId(value);
  }

  static generate(): TemplateId {
    return new TemplateId(this.generateUuid());
  }

  private static generateUuid(): string {
    // Use Web Crypto API for browser compatibility
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers or environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TemplateId): boolean {
    return this.value === other.value;
  }

  private static isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}