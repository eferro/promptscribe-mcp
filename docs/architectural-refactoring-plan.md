# Architectural Refactoring Plan: Domain Models & Repository Pattern

## 🎯 **Mission Statement**

Refactor the PromptScribe MCP application to eliminate architectural pain points by implementing **Domain-Driven Design** principles and **Repository Pattern**, following **Extreme Programming (XP)** methodology with emphasis on **simplicity**, **clean code**, and **evolutionary architecture**.

---

## 🧠 **XP Developer Mindset Requirements**

**As a Senior XP Developer, you MUST:**

- **Prioritize Simplicity**: Choose the simplest solution that works
- **Write Clean Code**: Small classes, meaningful names, no duplication
- **Follow TDD Religiously**: Red → Green → Refactor on every change
- **Take Small Steps**: Implement only what's needed to pass current test
- **Refactor Fearlessly**: Improve structure while keeping tests green
- **Communicate Intent**: Code should be self-documenting
- **Maintain Continuous Delivery**: Keep code deployable at all times

**Code Quality Standards:**
- **Functions < 20 lines** (highlight any longer)
- **Classes with single responsibility**
- **No duplicated logic**
- **Meaningful variable/method names**
- **100% test coverage for business logic**

---

## 🔍 **Current Architecture Problems**

### **Problem 1: Persistence Layer Coupling**
```typescript
// CURRENT: src/services/templateService.ts
export async function saveTemplate(payload: any, id?: string) {
  if (id) {
    return handleRequest(
      supabase.from('prompt_templates').update(payload).eq('id', id),
      'Failed to save template'
    );
  }
  return handleRequest(
    supabase.from('prompt_templates').insert([payload]),
    'Failed to save template'
  );
}
```
**Issues:**
- Direct Supabase coupling
- `any` type loses safety
- Business logic mixed with persistence
- Impossible to unit test without Supabase
- Cannot switch databases without full rewrite

### **Problem 2: Anemic Domain Models**
```typescript
// CURRENT: src/types/template.ts
export interface MCPTemplate {
  id: string;
  name: string;
  description: string | null;
  template_data: TemplateData | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}
```
**Issues:**
- No behavior, only data structure
- Validation scattered in UI components
- No business rules encapsulation
- No domain invariants protection

### **Problem 3: UI Components with Business Logic**
```typescript
// CURRENT: src/components/templates/TemplateEditor.tsx lines 55-72
const handleSave = async () => {
  if (!name.trim()) {
    toast({ variant: "destructive", title: "Validation Error", description: "Template name is required" });
    return;
  }
  if (messages.length === 0) {
    toast({ variant: "destructive", title: "Validation Error", description: "At least one message is required" });
    return;
  }
  // Business logic mixed with UI...
}
```
**Issues:**
- Validation in presentation layer
- Business rules in UI components
- Difficult to test business logic
- Potential duplication across components

---

## 🏗️ **Target Architecture**

```
src/
├── domain/
│   ├── entities/
│   │   └── Template.ts           # Rich domain model
│   ├── valueObjects/
│   │   ├── TemplateId.ts
│   │   ├── TemplateName.ts
│   │   └── UserId.ts
│   ├── repositories/
│   │   └── TemplateRepository.ts  # Interface only
│   └── errors/
│       └── DomainError.ts
├── application/
│   └── TemplateApplicationService.ts  # Use cases
├── infrastructure/
│   └── repositories/
│       └── SupabaseTemplateRepository.ts  # Implementation
└── components/                    # Clean UI only
```

---

## 📋 **Implementation Phases**

## **PHASE 1: Value Objects Foundation**

### **Step 1.1: TemplateName Value Object**

**🔴 FIRST: Write Failing Test**
Create: `src/domain/valueObjects/TemplateName.test.ts`
```typescript
import { TemplateName } from './TemplateName';

describe('TemplateName', () => {
  describe('create', () => {
    it('should create valid template name', () => {
      const name = TemplateName.create('My Template');
      expect(name.getValue()).toBe('My Template');
    });

    it('should trim whitespace', () => {
      const name = TemplateName.create('  My Template  ');
      expect(name.getValue()).toBe('My Template');
    });

    it('should throw for empty name', () => {
      expect(() => TemplateName.create('')).toThrow('Template name cannot be empty');
      expect(() => TemplateName.create('   ')).toThrow('Template name cannot be empty');
    });

    it('should throw for name too long', () => {
      const longName = 'a'.repeat(101);
      expect(() => TemplateName.create(longName)).toThrow('Template name cannot exceed 100 characters');
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const name1 = TemplateName.create('Template');
      const name2 = TemplateName.create('Template');
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different values', () => {
      const name1 = TemplateName.create('Template1');
      const name2 = TemplateName.create('Template2');
      expect(name1.equals(name2)).toBe(false);
    });
  });
});
```

**🟢 THEN: Make Tests Pass**
Create: `src/domain/valueObjects/TemplateName.ts`
```typescript
export class TemplateName {
  private constructor(private readonly value: string) {}

  static create(value: string): TemplateName {
    const trimmed = value.trim();
    
    if (!trimmed) {
      throw new Error('Template name cannot be empty');
    }
    
    if (trimmed.length > 100) {
      throw new Error('Template name cannot exceed 100 characters');
    }
    
    return new TemplateName(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TemplateName): boolean {
    return this.value === other.value;
  }
}
```

**✅ Acceptance Criteria:**
- [ ] All tests pass
- [ ] No linting errors
- [ ] Code coverage 100%
- [ ] Function < 20 lines each
- [ ] Meaningful names used

### **Step 1.2: Additional Value Objects**

**Create these following same TDD pattern:**

1. **TemplateDescription** (`src/domain/valueObjects/TemplateDescription.ts`)
   - Max 500 characters
   - Can be null
   - Trims whitespace

2. **TemplateId** (`src/domain/valueObjects/TemplateId.ts`)
   - UUID format validation
   - Generate new IDs
   - Equality comparison

3. **UserId** (`src/domain/valueObjects/UserId.ts`)
   - UUID format validation
   - Equality comparison

**Test Pattern Template:**
```typescript
describe('[ValueObjectName]', () => {
  describe('create', () => {
    it('should create valid [object]', () => {
      // Test valid creation
    });
    
    it('should validate constraints', () => {
      // Test all validation rules
    });
  });

  describe('equals', () => {
    // Test equality behavior
  });
});
```

---

## **PHASE 2: Domain Entity**

### **Step 2.1: Template Entity**

**🔴 FIRST: Write Failing Test**
Create: `src/domain/entities/Template.test.ts`
```typescript
import { Template } from './Template';
import { TemplateId } from '../valueObjects/TemplateId';
import { TemplateName } from '../valueObjects/TemplateName';
import { UserId } from '../valueObjects/UserId';

describe('Template', () => {
  const validParams = {
    name: 'Test Template',
    description: 'Test description',
    messages: [{ role: 'user' as const, content: 'Hello' }],
    arguments_: [],
    userId: 'user-123',
    isPublic: false
  };

  describe('create', () => {
    it('should create template with valid data', () => {
      const template = Template.create(validParams);
      
      expect(template.getName().getValue()).toBe('Test Template');
      expect(template.getDescription()?.getValue()).toBe('Test description');
      expect(template.isPublic()).toBe(false);
      expect(template.getMessages()).toHaveLength(1);
    });

    it('should throw if no messages provided', () => {
      const params = { ...validParams, messages: [] };
      expect(() => Template.create(params)).toThrow('Template must have at least one message');
    });

    it('should generate unique ID', () => {
      const template1 = Template.create(validParams);
      const template2 = Template.create(validParams);
      expect(template1.getId().equals(template2.getId())).toBe(false);
    });

    it('should set creation timestamps', () => {
      const before = new Date();
      const template = Template.create(validParams);
      const after = new Date();
      
      expect(template.getCreatedAt().getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(template.getCreatedAt().getTime()).toBeLessThanOrEqual(after.getTime());
      expect(template.getUpdatedAt().getTime()).toBe(template.getCreatedAt().getTime());
    });
  });

  describe('updateName', () => {
    it('should update name and timestamp', () => {
      const template = Template.create(validParams);
      const originalUpdatedAt = template.getUpdatedAt();
      
      // Wait to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));
      
      template.updateName('New Name');
      
      expect(template.getName().getValue()).toBe('New Name');
      expect(template.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should validate new name', () => {
      const template = Template.create(validParams);
      expect(() => template.updateName('')).toThrow('Template name cannot be empty');
    });
  });

  describe('isOwnedBy', () => {
    it('should return true for owner', () => {
      const template = Template.create(validParams);
      const userId = UserId.create('user-123');
      expect(template.isOwnedBy(userId)).toBe(true);
    });

    it('should return false for non-owner', () => {
      const template = Template.create(validParams);
      const userId = UserId.create('user-456');
      expect(template.isOwnedBy(userId)).toBe(false);
    });
  });

  describe('canBeEditedBy', () => {
    it('should allow owner to edit', () => {
      const template = Template.create(validParams);
      const userId = UserId.create('user-123');
      expect(template.canBeEditedBy(userId)).toBe(true);
    });

    it('should not allow non-owner to edit', () => {
      const template = Template.create(validParams);
      const userId = UserId.create('user-456');
      expect(template.canBeEditedBy(userId)).toBe(false);
    });
  });
});
```

**🟢 THEN: Make Tests Pass**
Create: `src/domain/entities/Template.ts`
```typescript
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
```

---

## **PHASE 3: Repository Pattern**

### **Step 3.1: Repository Interface**

**🔴 FIRST: Write Repository Interface Test**
Create: `src/domain/repositories/TemplateRepository.test.ts`
```typescript
// This is a contract test - tests the interface behavior
import { TemplateRepository } from './TemplateRepository';
import { Template } from '../entities/Template';
import { TemplateId } from '../valueObjects/TemplateId';
import { UserId } from '../valueObjects/UserId';

// This will be extended by concrete implementation tests
export abstract class TemplateRepositoryContractTest {
  protected abstract createRepository(): TemplateRepository;
  protected abstract cleanup(): Promise<void>;

  describe('TemplateRepository Contract', () => {
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
        userId: 'user-123',
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
      const userId = UserId.create('user-123');
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
        userId: 'user-123',
        isPublic: false
      });

      await repository.save(template);
      await repository.delete(template.getId());
      
      const found = await repository.findById(template.getId());
      expect(found).toBeNull();
    });
  });
}
```

**🟢 THEN: Create Repository Interface**
Create: `src/domain/repositories/TemplateRepository.ts`
```typescript
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
```

### **Step 3.2: Supabase Implementation**

**🔴 FIRST: Write Implementation Test**
Create: `src/infrastructure/repositories/SupabaseTemplateRepository.test.ts`
```typescript
import { SupabaseTemplateRepository } from './SupabaseTemplateRepository';
import { TemplateRepositoryContractTest } from '../../domain/repositories/TemplateRepository.test';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase for testing
const mockSupabase = createClient('http://localhost', 'fake-key');

class SupabaseTemplateRepositoryTest extends TemplateRepositoryContractTest {
  protected createRepository() {
    return new SupabaseTemplateRepository(mockSupabase);
  }

  protected async cleanup() {
    // Clean up test data
  }
}

// Run the contract tests
const tests = new SupabaseTemplateRepositoryTest();
tests.describe('SupabaseTemplateRepository', () => {
  // Contract tests will be run here
});

describe('SupabaseTemplateRepository Specific Tests', () => {
  it('should handle supabase errors gracefully', async () => {
    // Test error handling specific to Supabase
  });

  it('should map domain objects to supabase format correctly', async () => {
    // Test mapping logic
  });
});
```

**🟢 THEN: Implement Supabase Repository**
Create: `src/infrastructure/repositories/SupabaseTemplateRepository.ts`
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { TemplateRepository } from '../../domain/repositories/TemplateRepository';
import { Template } from '../../domain/entities/Template';
import { TemplateId } from '../../domain/valueObjects/TemplateId';
import { UserId } from '../../domain/valueObjects/UserId';
import { Database } from '../supabase/types';

export class SupabaseTemplateRepository implements TemplateRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findById(id: TemplateId): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', id.getValue())
      .single();

    if (error || !data) return null;
    return this.mapToDomain(data);
  }

  async findByUser(userId: UserId): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('user_id', userId.getValue())
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data.map(row => this.mapToDomain(row));
  }

  async findPublic(): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data.map(row => this.mapToDomain(row));
  }

  async save(template: Template): Promise<void> {
    const payload = this.mapToSupabase(template);
    
    const { error } = await this.supabase
      .from('prompt_templates')
      .upsert([payload]);

    if (error) {
      throw new Error(`Failed to save template: ${error.message}`);
    }
  }

  async delete(id: TemplateId): Promise<void> {
    const { error } = await this.supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id.getValue());

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }

  private mapToDomain(row: any): Template {
    // This is a reconstruction method - Template should have static fromPersistence method
    return Template.fromPersistence({
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      isPublic: row.is_public,
      messages: row.template_data?.messages || [],
      arguments_: row.template_data?.arguments || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  private mapToSupabase(template: Template): any {
    return {
      id: template.getId().getValue(),
      name: template.getName().getValue(),
      description: template.getDescription()?.getValue() || null,
      user_id: template.getUserId().getValue(),
      is_public: template.isPublic(),
      template_data: {
        messages: template.getMessages(),
        arguments: template.getArguments()
      },
      created_at: template.getCreatedAt().toISOString(),
      updated_at: template.getUpdatedAt().toISOString()
    };
  }
}
```

---

## **PHASE 4: Application Service**

### **Step 4.1: Application Service**

**🔴 FIRST: Write Application Service Test**
Create: `src/application/TemplateApplicationService.test.ts`
```typescript
import { TemplateApplicationService } from './TemplateApplicationService';
import { TemplateRepository } from '../domain/repositories/TemplateRepository';
import { Template } from '../domain/entities/Template';
import { UserId } from '../domain/valueObjects/UserId';

describe('TemplateApplicationService', () => {
  let service: TemplateApplicationService;
  let mockRepository: jest.Mocked<TemplateRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByUser: jest.fn(),
      findPublic: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    };
    service = new TemplateApplicationService(mockRepository);
  });

  describe('createTemplate', () => {
    it('should create and save template', async () => {
      const command = {
        name: 'Test Template',
        description: 'Test description',
        messages: [{ role: 'user' as const, content: 'Hello' }],
        arguments_: [],
        userId: 'user-123',
        isPublic: false
      };

      await service.createTemplate(command);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          getName: expect.any(Function),
          getDescription: expect.any(Function),
          getUserId: expect.any(Function),
          isPublic: expect.any(Function)
        })
      );
    });

    it('should reject invalid template data', async () => {
      const command = {
        name: '',
        description: '',
        messages: [],
        arguments_: [],
        userId: 'user-123',
        isPublic: false
      };

      await expect(service.createTemplate(command)).rejects.toThrow();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getUserTemplates', () => {
    it('should return user templates', async () => {
      const userId = 'user-123';
      const mockTemplates = [
        Template.create({
          name: 'Template 1',
          messages: [{ role: 'user', content: 'Hello' }],
          arguments_: [],
          userId,
          isPublic: false
        })
      ];
      
      mockRepository.findByUser.mockResolvedValue(mockTemplates);

      const result = await service.getUserTemplates(userId);

      expect(result).toHaveLength(1);
      expect(mockRepository.findByUser).toHaveBeenCalledWith(
        expect.objectContaining({ getValue: expect.any(Function) })
      );
    });
  });

  describe('updateTemplate', () => {
    it('should update template if user is owner', async () => {
      const template = Template.create({
        name: 'Original',
        messages: [{ role: 'user', content: 'Hello' }],
        arguments_: [],
        userId: 'user-123',
        isPublic: false
      });
      
      mockRepository.findById.mockResolvedValue(template);

      await service.updateTemplate({
        id: template.getId().getValue(),
        name: 'Updated Name',
        userId: 'user-123'
      });

      expect(template.getName().getValue()).toBe('Updated Name');
      expect(mockRepository.save).toHaveBeenCalledWith(template);
    });

    it('should throw if user is not owner', async () => {
      const template = Template.create({
        name: 'Original',
        messages: [{ role: 'user', content: 'Hello' }],
        arguments_: [],
        userId: 'user-123',
        isPublic: false
      });
      
      mockRepository.findById.mockResolvedValue(template);

      await expect(service.updateTemplate({
        id: template.getId().getValue(),
        name: 'Updated Name',
        userId: 'user-456' // Different user
      })).rejects.toThrow('User not authorized to edit this template');
    });
  });
});
```

**🟢 THEN: Implement Application Service**
Create: `src/application/TemplateApplicationService.ts`
```typescript
import { TemplateRepository } from '../domain/repositories/TemplateRepository';
import { Template } from '../domain/entities/Template';
import { TemplateId } from '../domain/valueObjects/TemplateId';
import { UserId } from '../domain/valueObjects/UserId';

export interface CreateTemplateCommand {
  name: string;
  description?: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  arguments_: Array<{ name: string; description: string; required: boolean; type?: string }>;
  userId: string;
  isPublic: boolean;
}

export interface UpdateTemplateCommand {
  id: string;
  name?: string;
  description?: string | null;
  userId: string;
}

export class TemplateApplicationService {
  constructor(private repository: TemplateRepository) {}

  async createTemplate(command: CreateTemplateCommand): Promise<string> {
    const template = Template.create({
      name: command.name,
      description: command.description,
      messages: command.messages,
      arguments_: command.arguments_,
      userId: command.userId,
      isPublic: command.isPublic
    });

    await this.repository.save(template);
    return template.getId().getValue();
  }

  async getUserTemplates(userId: string): Promise<Template[]> {
    const userIdVO = UserId.create(userId);
    return await this.repository.findByUser(userIdVO);
  }

  async getPublicTemplates(): Promise<Template[]> {
    return await this.repository.findPublic();
  }

  async getTemplate(id: string): Promise<Template | null> {
    const templateId = TemplateId.create(id);
    return await this.repository.findById(templateId);
  }

  async updateTemplate(command: UpdateTemplateCommand): Promise<void> {
    const templateId = TemplateId.create(command.id);
    const userId = UserId.create(command.userId);
    
    const template = await this.repository.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    if (!template.canBeEditedBy(userId)) {
      throw new Error('User not authorized to edit this template');
    }

    if (command.name !== undefined) {
      template.updateName(command.name);
    }

    if (command.description !== undefined) {
      template.updateDescription(command.description);
    }

    await this.repository.save(template);
  }

  async deleteTemplate(id: string, userId: string): Promise<void> {
    const templateId = TemplateId.create(id);
    const userIdVO = UserId.create(userId);
    
    const template = await this.repository.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    if (!template.canBeEditedBy(userIdVO)) {
      throw new Error('User not authorized to delete this template');
    }

    await this.repository.delete(templateId);
  }
}
```

---

## **PHASE 5: UI Integration**

### **Step 5.1: Update TemplateEditor Component**

**Goal: Remove business logic from UI, use Application Service**

**🔴 FIRST: Update TemplateEditor Test**
Update: `src/components/templates/TemplateEditor.test.tsx`
```typescript
// Add mocks for application service
const mockTemplateService = {
  createTemplate: jest.fn(),
  updateTemplate: jest.fn(),
};

// Update tests to verify service calls instead of direct validation
it('should call createTemplate service on save', async () => {
  // Test that component calls service correctly
});

it('should display domain validation errors', async () => {
  mockTemplateService.createTemplate.mockRejectedValue(new Error('Template name cannot be empty'));
  // Test that domain errors are displayed properly
});
```

**🟢 THEN: Refactor TemplateEditor**
Update: `src/components/templates/TemplateEditor.tsx`
```typescript
// Remove validation logic - let domain handle it
const handleSave = async () => {
  setLoading(true);
  
  try {
    const { data: { user } } = await getUser();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to save templates"
      });
      return;
    }

    const command = {
      name,
      description,
      messages,
      arguments_,
      userId: user.id,
      isPublic
    };

    if (template?.id) {
      await templateApplicationService.updateTemplate({
        ...command,
        id: template.id
      });
      toast({ title: "Success", description: "Template updated successfully" });
    } else {
      await templateApplicationService.createTemplate(command);
      toast({ title: "Success", description: "Template created successfully" });
    }
    
    onSave();
  } catch (error: Error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message // Domain error messages are now shown directly
    });
  } finally {
    setLoading(false);
  }
};
```

---

## **PHASE 6: Dependency Injection Setup**

### **Step 6.1: Simple Service Container**

Create: `src/infrastructure/ServiceContainer.ts`
```typescript
export class ServiceContainer {
  private static instance: ServiceContainer;
  private services = new Map<string, any>();

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  register<T>(token: string, factory: () => T): void {
    this.services.set(token, factory);
  }

  resolve<T>(token: string): T {
    const factory = this.services.get(token);
    if (!factory) {
      throw new Error(`Service not registered: ${token}`);
    }
    return factory();
  }
}

// Setup services
const container = ServiceContainer.getInstance();

container.register('supabase', () => supabase);
container.register('templateRepository', () => 
  new SupabaseTemplateRepository(container.resolve('supabase'))
);
container.register('templateApplicationService', () => 
  new TemplateApplicationService(container.resolve('templateRepository'))
);
```

---

## 🎯 **Implementation Checklist**

### **Phase 1: Value Objects** ✅ **PRIORITY 1**
- [ ] TemplateName with tests (TDD)
- [ ] TemplateDescription with tests (TDD)
- [ ] TemplateId with tests (TDD)
- [ ] UserId with tests (TDD)
- [ ] All tests passing
- [ ] 100% code coverage on value objects

### **Phase 2: Domain Entity** ✅ **PRIORITY 1**
- [ ] Template entity with tests (TDD)
- [ ] Business methods implemented
- [ ] Domain validation logic moved from UI
- [ ] All tests passing
- [ ] Template.fromPersistence method for reconstruction

### **Phase 3: Repository Pattern** ✅ **PRIORITY 2**
- [ ] Repository interface with contract tests
- [ ] SupabaseTemplateRepository implementation
- [ ] Integration tests passing
- [ ] Error handling implemented

### **Phase 4: Application Service** ✅ **PRIORITY 2**
- [ ] TemplateApplicationService with tests
- [ ] Use cases implemented
- [ ] Authorization logic in place
- [ ] All tests passing

### **Phase 5: UI Integration** ✅ **PRIORITY 3**
- [ ] TemplateEditor refactored
- [ ] Dashboard refactored
- [ ] Business logic removed from components
- [ ] Clean separation of concerns

### **Phase 6: Dependency Injection** ✅ **PRIORITY 3**
- [ ] Service container implemented
- [ ] Services wired up correctly
- [ ] Easy to test with mocks

---

## 🚀 **Success Criteria**

### **Code Quality Metrics**
- [ ] All functions < 20 lines
- [ ] All classes have single responsibility
- [ ] Zero code duplication
- [ ] 100% test coverage for business logic
- [ ] All tests passing (Green build)

### **Architecture Quality**
- [ ] Business rules in domain layer only
- [ ] UI components have no business logic
- [ ] Database can be swapped without domain changes
- [ ] Clear separation of concerns
- [ ] Easy to add new features without breaking existing code

### **XP Practices Followed**
- [ ] TDD used for all new code
- [ ] Refactoring done only with passing tests
- [ ] Small incremental changes
- [ ] Continuous integration maintained
- [ ] Simple design evolved organically

---

## 📝 **Notes for Autonomous Agent**

### **Working Style**
1. **Always start with failing test**
2. **Write minimum code to pass**
3. **Refactor only with green tests**
4. **One small change at a time**
5. **Keep all existing tests passing**

### **When in Doubt**
- Choose simplicity over cleverness
- Prefer composition over inheritance
- Keep functions small and focused
- Make intent clear through naming
- Ask "What would Kent Beck do?"

### **Red Flags to Avoid**
- Functions > 20 lines
- Classes with multiple responsibilities
- Business logic in UI components
- Direct database calls from components
- Any `any` types in new code
- Duplicated validation logic

---

## 🔄 **Rollback Strategy**

If any phase fails or causes issues:
1. **Revert to last green build**
2. **Analyze what went wrong**
3. **Make smaller incremental change**
4. **Ensure all tests pass before continuing**

Each phase should be independently deployable and reversible.

---

**Remember: The goal is not just working code, but code that is easy to understand, modify, and extend. Every line should serve the purpose of making the next developer's (including your future self's) job easier.**
