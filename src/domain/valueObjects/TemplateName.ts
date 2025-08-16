import { ValidationError } from '../errors/DomainError';

export class TemplateName {
  private constructor(private readonly value: string) {}

  static create(value: string): TemplateName {
    const trimmed = value.trim();
    
    if (!trimmed) {
      throw new ValidationError('Template name cannot be empty', 'name');
    }
    
    if (trimmed.length > 100) {
      throw new ValidationError('Template name cannot exceed 100 characters', 'name');
    }
    
    return new TemplateName(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TemplateName): boolean {
    return this.value === other.value;
  }
}