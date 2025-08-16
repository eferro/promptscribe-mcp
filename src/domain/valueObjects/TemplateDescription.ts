// Temporary compatibility layer - to be removed in Phase 2
export class TemplateDescription {
  constructor(private readonly value: string) {}

  static create(value: string): TemplateDescription {
    if (value && value.length > 1000) {
      throw new Error('Template description cannot exceed 1000 characters');
    }
    return new TemplateDescription(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TemplateDescription): boolean {
    return this.value === other.value;
  }
}