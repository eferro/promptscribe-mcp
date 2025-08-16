import { TemplateId } from '../valueObjects/TemplateId';
import { TemplateName } from '../valueObjects/TemplateName';
import { TemplateDescription } from '../valueObjects/TemplateDescription';
import { UserId } from '../valueObjects/UserId';

export interface TemplateMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TemplateArgument {
  name: string;
  description: string;
  required: boolean;
  type?: string;
}

export interface CreateTemplateParams {
  name: string;
  description?: string;
  messages: TemplateMessage[];
  arguments_: TemplateArgument[];
  userId: string;
  isPublic: boolean;
}

export interface TemplatePersistenceData {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  isPublic: boolean;
  messages: TemplateMessage[];
  arguments_: TemplateArgument[];
  createdAt: Date;
  updatedAt: Date;
}

export class Template {
  private constructor(
    private readonly id: TemplateId,
    private name: TemplateName,
    private description: TemplateDescription | null,
    private readonly userId: UserId,
    private _isPublic: boolean,
    private messages: TemplateMessage[],
    private arguments_: TemplateArgument[],
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(params: CreateTemplateParams): Template {
    if (params.messages.length === 0) {
      throw new Error('Template must have at least one message');
    }

    const now = new Date();
    
    return new Template(
      TemplateId.generate(),
      TemplateName.create(params.name),
      params.description ? TemplateDescription.create(params.description) : null,
      UserId.create(params.userId),
      params.isPublic,
      [...params.messages], // Copy to prevent external mutation
      [...params.arguments_], // Copy to prevent external mutation
      now,
      now
    );
  }

  static fromPersistence(data: TemplatePersistenceData): Template {
    return new Template(
      TemplateId.create(data.id),
      TemplateName.create(data.name),
      data.description ? TemplateDescription.create(data.description) : null,
      UserId.create(data.userId),
      data.isPublic,
      [...data.messages], // Copy to prevent external mutation
      [...data.arguments_], // Copy to prevent external mutation
      data.createdAt,
      data.updatedAt
    );
  }

  // Getters
  getId(): TemplateId { return this.id; }
  getName(): TemplateName { return this.name; }
  getDescription(): TemplateDescription | null { return this.description; }
  getUserId(): UserId { return this.userId; }
  isPublic(): boolean { return this._isPublic; }
  getMessages(): TemplateMessage[] { return [...this.messages]; }
  getArguments(): TemplateArgument[] { return [...this.arguments_]; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  // Business Methods
  updateName(newName: string): void {
    this.name = TemplateName.create(newName);
    this.updatedAt = new Date();
  }

  updateDescription(newDescription: string | null): void {
    this.description = newDescription ? TemplateDescription.create(newDescription) : null;
    this.updatedAt = new Date();
  }

  isOwnedBy(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  canBeEditedBy(userId: UserId): boolean {
    return this.isOwnedBy(userId);
  }

  makePublic(): void {
    this._isPublic = true;
    this.updatedAt = new Date();
  }

  makePrivate(): void {
    this._isPublic = false;
    this.updatedAt = new Date();
  }
}