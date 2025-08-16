// Temporary compatibility layer - to be removed in Phase 2
export class TemplateId {
  constructor(private readonly value: string) {}

  static create(value: string): TemplateId {
    return new TemplateId(value);
  }

  static generate(): TemplateId {
    return new TemplateId(crypto.randomUUID());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TemplateId): boolean {
    return this.value === other.value;
  }
}