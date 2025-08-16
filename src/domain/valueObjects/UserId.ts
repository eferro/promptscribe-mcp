import { ValidationError } from '../errors/DomainError';

export class UserId {
  private constructor(private readonly value: string) {}

  static create(value: string): UserId {
    if (!this.isValidUuid(value)) {
      throw new ValidationError('Invalid user ID format', 'userId');
    }
    
    return new UserId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  private static isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}