// Temporary compatibility layer - to be removed in Phase 2
export class UserId {
  constructor(private readonly value: string) {}

  static create(value: string): UserId {
    return new UserId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}