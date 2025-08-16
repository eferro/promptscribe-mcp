export type Factory<T = any> = (container: Container) => T;

export class Container {
  private services = new Map<string, Factory>();
  private instances = new Map<string, any>();

  register<T>(name: string, factory: Factory<T>): void {
    this.services.set(name, factory);
  }

  resolve<T>(name: string): T {
    // Return cached instance if exists
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    // Get factory function
    const factory = this.services.get(name);
    if (!factory) {
      throw new Error(`Service ${name} is not registered`);
    }

    // Create and cache instance
    const instance = factory(this);
    this.instances.set(name, instance);
    
    return instance;
  }

  clear(): void {
    this.services.clear();
    this.instances.clear();
  }
}