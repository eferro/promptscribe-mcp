export class TemplateDescription {
  private constructor(private readonly value: string) {}

  static create(value: string): TemplateDescription | null {
    const trimmed = value.trim();
    
    if (!trimmed) {
      return null;
    }
    
    if (trimmed.length > 500) {
      throw new Error('Template description cannot exceed 500 characters');
    }
    
    return new TemplateDescription(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TemplateDescription): boolean {
    return this.value === other.value;
  }
}