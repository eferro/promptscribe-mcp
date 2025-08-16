// Temporary compatibility layer - to be removed in Phase 2
export class TemplateName {
  constructor(private readonly value: string) {}

  static create(value: string): TemplateName {
    if (!value?.trim()) {
      throw new Error('Template name cannot be empty');
    }
    if (value.length > 100) {
      throw new Error('Template name cannot exceed 100 characters');
    }
    return new TemplateName(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TemplateName): boolean {
    return this.value === other.value;
  }
}