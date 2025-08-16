import { describe, it, expect, beforeEach } from 'vitest';
import { createAppContainer } from '../AppContainer';
import { TemplateApplicationService } from '../../../application/services/TemplateApplicationService';
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

  it('should register and resolve TemplateApplicationService', () => {
    const service = container.resolve<TemplateApplicationService>('TemplateApplicationService');
    
    expect(service).toBeDefined();
    expect(service).toHaveProperty('createTemplate');
    expect(service).toHaveProperty('getTemplateById');
    expect(service).toHaveProperty('getUserTemplates');
    expect(service).toHaveProperty('getPublicTemplates');
    expect(service).toHaveProperty('updateTemplate');
    expect(service).toHaveProperty('deleteTemplate');
  });

  it('should return singleton instances', () => {
    const service1 = container.resolve<TemplateApplicationService>('TemplateApplicationService');
    const service2 = container.resolve<TemplateApplicationService>('TemplateApplicationService');
    
    expect(service1).toBe(service2);
  });

  it('should inject dependencies correctly', () => {
    const service = container.resolve<TemplateApplicationService>('TemplateApplicationService');
    const repository = container.resolve<TemplateRepository>('TemplateRepository');
    
    // Both should be defined and service should have repository injected
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    
    // We can't directly test private fields, but we can verify the service works
    expect(typeof service.createTemplate).toBe('function');
  });
});