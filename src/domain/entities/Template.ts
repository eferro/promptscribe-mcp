// Temporary compatibility layer - to be removed in Phase 2
// This file provides compatibility with the old domain entity API

import { BusinessRuleError } from '../errors/DomainError';

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

// Simple class that wraps the new Template interface with the old API
export class Template {
  private data: any;

  private constructor(data: any) {
    this.data = data;
  }

  static create(params: CreateTemplateParams): Template {
    if (params.messages.length === 0) {
      throw new BusinessRuleError('Template must have at least one message', 'MinimumMessagesRule');
    }

    const now = new Date();
    
    const data = {
      id: crypto.randomUUID(),
      name: params.name,
      description: params.description,
      userId: params.userId,
      isPublic: params.isPublic,
      messages: [...params.messages],
      arguments_: [...params.arguments_],
      createdAt: now,
      updatedAt: now
    };

    return new Template(data);
  }

  static fromPersistence(data: TemplatePersistenceData): Template {
    return new Template({
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.userId,
      isPublic: data.isPublic,
      messages: [...data.messages],
      arguments_: [...data.arguments_],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }

  // Legacy getters - return simple values instead of value objects
  getId(): any { return { getValue: () => this.data.id }; }
  getName(): any { return { getValue: () => this.data.name }; }
  getDescription(): any { return this.data.description ? { getValue: () => this.data.description } : null; }
  getUserId(): any { return { getValue: () => this.data.userId }; }
  isPublic(): boolean { return this.data.isPublic; }
  getMessages(): TemplateMessage[] { return [...this.data.messages]; }
  getArguments(): TemplateArgument[] { return [...this.data.arguments_]; }
  getCreatedAt(): Date { return this.data.createdAt; }
  getUpdatedAt(): Date { return this.data.updatedAt; }

  // Business Methods
  updateName(newName: string): void {
    this.data.name = newName;
    this.data.updatedAt = new Date();
  }

  updateDescription(newDescription: string | null): void {
    this.data.description = newDescription;
    this.data.updatedAt = new Date();
  }

  isOwnedBy(userId: any): boolean {
    const userIdValue = typeof userId === 'string' ? userId : userId.getValue();
    return this.data.userId === userIdValue;
  }

  canBeEditedBy(userId: any): boolean {
    return this.isOwnedBy(userId);
  }

  makePublic(): void {
    this.data.isPublic = true;
    this.data.updatedAt = new Date();
  }

  makePrivate(): void {
    this.data.isPublic = false;
    this.data.updatedAt = new Date();
  }
}