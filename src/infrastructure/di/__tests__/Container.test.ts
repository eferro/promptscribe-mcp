import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Container } from '../Container';

interface TestService {
  getValue(): string;
}

class TestServiceImpl implements TestService {
  getValue(): string {
    return 'test-value';
  }
}

interface DependentService {
  getResult(): string;
}

class DependentServiceImpl implements DependentService {
  constructor(private testService: TestService) {}

  getResult(): string {
    return `result-${this.testService.getValue()}`;
  }
}

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe('register and resolve', () => {
    it('should register and resolve a simple service', () => {
      container.register('TestService', () => new TestServiceImpl());

      const service = container.resolve<TestService>('TestService');

      expect(service.getValue()).toBe('test-value');
    });

    it('should return singleton instances by default', () => {
      container.register('TestService', () => new TestServiceImpl());

      const service1 = container.resolve<TestService>('TestService');
      const service2 = container.resolve<TestService>('TestService');

      expect(service1).toBe(service2);
    });

    it('should resolve dependencies', () => {
      container.register('TestService', () => new TestServiceImpl());
      container.register('DependentService', (c) => 
        new DependentServiceImpl(c.resolve<TestService>('TestService'))
      );

      const service = container.resolve<DependentService>('DependentService');

      expect(service.getResult()).toBe('result-test-value');
    });

    it('should throw error when resolving unregistered service', () => {
      expect(() => container.resolve('UnknownService')).toThrow('Service UnknownService is not registered');
    });
  });
});