import { randomUUID } from 'crypto';
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
    return new TemplateId(randomUUID());
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