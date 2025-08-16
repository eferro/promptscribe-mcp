import { describe, it, expect, beforeEach } from 'vitest';
import { createAppContainer } from '../AppContainer';
import { TemplateRepository } from '../../../domain/repositories/TemplateRepository';
import { Container } from '../Container';

describe('AppContainer', () => {
  let container: Container;

  beforeEach(() => {
    container = createAppContainer();
  });

  it('should register and resolve TemplateRepository', () => {
    const repository = container.resolve<TemplateRepository>('TemplateRepository');
    
    expect(repository).toBeDefined();
    expect(repository).toHaveProperty('findById');
    expect(repository).toHaveProperty('findByUser');
    expect(repository).toHaveProperty('findPublic');
    expect(repository).toHaveProperty('save');
    expect(repository).toHaveProperty('delete');
  });

  it('should return singleton instances for repository', () => {
    const repository1 = container.resolve<TemplateRepository>('TemplateRepository');
    const repository2 = container.resolve<TemplateRepository>('TemplateRepository');
    
    expect(repository1).toBe(repository2);
  });
});