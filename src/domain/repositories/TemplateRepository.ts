import { Template } from '../entities/Template';
import { TemplateId } from '../valueObjects/TemplateId';
import { UserId } from '../valueObjects/UserId';

export interface TemplateRepository {
  findById(id: TemplateId): Promise<Template | null>;
  findByUser(userId: UserId): Promise<Template[]>;
  findPublic(): Promise<Template[]>;
  save(template: Template): Promise<void>;
  delete(id: TemplateId): Promise<void>;
}