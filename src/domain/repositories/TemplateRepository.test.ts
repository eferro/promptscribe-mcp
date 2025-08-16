// This is a contract test base class - tests the interface behavior
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TemplateRepository } from './TemplateRepository';
import { Template } from '../entities/Template';
import { TemplateId } from '../valueObjects/TemplateId';
import { UserId } from '../valueObjects/UserId';

// This will be extended by concrete implementation tests
export abstract class TemplateRepositoryContractTest {
  protected abstract createRepository(): TemplateRepository;
  protected abstract cleanup(): Promise<void>;

  getContractTests() {
    return () => {
      let repository: TemplateRepository;

      beforeEach(() => {
        repository = this.createRepository();
      });

      afterEach(async () => {
        await this.cleanup();
      });

      it('should save and find template by id', async () => {
        const template = Template.create({
          name: 'Test Template',
          messages: [{ role: 'user', content: 'Hello' }],
          arguments_: [],
          userId: '123e4567-e89b-12d3-a456-426614174000',
          isPublic: false
        });

        await repository.save(template);
        const found = await repository.findById(template.getId());

        expect(found).not.toBeNull();
        expect(found!.getId().equals(template.getId())).toBe(true);
        expect(found!.getName().getValue()).toBe('Test Template');
      });

      it('should return null for non-existent template', async () => {
        const nonExistentId = TemplateId.generate();
        const found = await repository.findById(nonExistentId);
        expect(found).toBeNull();
      });

      it('should find templates by user', async () => {
        const userId = UserId.create('123e4567-e89b-12d3-a456-426614174000');
        const template1 = Template.create({
          name: 'Template 1',
          messages: [{ role: 'user', content: 'Hello 1' }],
          arguments_: [],
          userId: userId.getValue(),
          isPublic: false
        });
        const template2 = Template.create({
          name: 'Template 2',
          messages: [{ role: 'user', content: 'Hello 2' }],
          arguments_: [],
          userId: userId.getValue(),
          isPublic: false
        });

        await repository.save(template1);
        await repository.save(template2);

        const userTemplates = await repository.findByUser(userId);
        expect(userTemplates).toHaveLength(2);
        expect(userTemplates.map(t => t.getName().getValue()).sort()).toEqual(['Template 1', 'Template 2']);
      });

      it('should delete template', async () => {
        const template = Template.create({
          name: 'To Delete',
          messages: [{ role: 'user', content: 'Hello' }],
          arguments_: [],
          userId: '123e4567-e89b-12d3-a456-426614174000',
          isPublic: false
        });

        await repository.save(template);
        await repository.delete(template.getId());
        
        const found = await repository.findById(template.getId());
        expect(found).toBeNull();
      });

      it('should find public templates', async () => {
        const publicTemplate = Template.create({
          name: 'Public Template',
          messages: [{ role: 'user', content: 'Public message' }],
          arguments_: [],
          userId: '123e4567-e89b-12d3-a456-426614174000',
          isPublic: true
        });
        const privateTemplate = Template.create({
          name: 'Private Template',
          messages: [{ role: 'user', content: 'Private message' }],
          arguments_: [],
          userId: '123e4567-e89b-12d3-a456-426614174000',
          isPublic: false
        });

        await repository.save(publicTemplate);
        await repository.save(privateTemplate);

        const publicTemplates = await repository.findPublic();
        expect(publicTemplates).toHaveLength(1);
        expect(publicTemplates[0].getName().getValue()).toBe('Public Template');
        expect(publicTemplates[0].isPublic()).toBe(true);
      });
    };
  }
}

// Dummy test to satisfy vitest
describe('TemplateRepositoryContractTest', () => {
  it('should be available for concrete implementations', () => {
    expect(TemplateRepositoryContractTest).toBeDefined();
  });
});