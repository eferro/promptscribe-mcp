# Simplified Architectural Refactoring Plan: XP Pragmatic Approach

## 🎯 **Mission Statement**

Refactor PromptScribe MCP to eliminate over-engineering and architectural complexity following **Extreme Programming (XP)** principles: **simplicity first**, **clean code**, and **evolutionary architecture**.

**Core Principle: "The simplest thing that could possibly work"**

---

## 🧠 **XP Developer Mindset**

**As a Senior XP Developer, prioritize:**

- **Simplicity over Cleverness**: Choose the most obvious solution
- **YAGNI**: You Aren't Gonna Need It - don't build what you don't need today
- **Clean Code**: Small functions, meaningful names, no duplication
- **TDD**: Red → Green → Refactor, but don't over-abstract
- **Evolutionary Design**: Let architecture emerge from requirements

**Quality Standards:**
- **Functions < 20 lines**
- **Components < 100 lines**
- **One responsibility per file**
- **No duplicated logic**
- **Meaningful names everywhere**

---

## 🔍 **Current Problems Analysis**

### **Problem 1: Over-Engineering Domain Layer**
```typescript
// CURRENT: Unnecessary complexity
class TemplateName {
  private constructor(private readonly value: string) {}
  static create(value: string): TemplateName { /* validation */ }
  getValue(): string { return this.value; }
  equals(other: TemplateName): boolean { /* comparison */ }
}

class TemplateId {
  static create(value: string): TemplateId { /* validation */ }
}

// SIMPLE SOLUTION: Just use TypeScript interfaces
interface Template {
  id: string;
  name: string;
  description?: string;
  // ... rest of properties
}
```

### **Problem 2: Multiple Service Layers**
```typescript
// CURRENT: Three different services doing similar things
- TemplateApplicationService
- templateService  
- templateServiceAdapter

// SIMPLE SOLUTION: One service class
class TemplateService {
  // All operations in one place
}
```

### **Problem 3: Monolithic Components**
```typescript
// CURRENT: Dashboard.tsx (281 lines)
- Authentication logic
- Template fetching
- Search functionality
- Navigation logic
- Delete confirmation
- State management

// SIMPLE SOLUTION: Extract focused components
- DashboardHeader
- TemplateSearch  
- TemplateGrid
- Dashboard (orchestration only)
```

---

## 🏗️ **Target Simple Architecture**

```
src/
├── components/           # Small, focused UI components
│   ├── Dashboard/       # Dashboard feature components
│   ├── Templates/       # Template feature components  
│   └── Auth/           # Auth feature components
├── hooks/               # Custom hooks for logic
├── services/            # ONE service per domain
│   └── TemplateService.ts
├── types/               # Simple TypeScript interfaces
│   └── template.ts
└── utils/              # Pure utility functions
```

**Key Differences:**
- ❌ No domain/valueObjects layer
- ❌ No application service layer  
- ❌ No dependency injection container
- ❌ No repository pattern (overkill for this app size)
- ✅ Simple services with clear methods
- ✅ React hooks for state management
- ✅ Small, focused components

---

## 📋 **Implementation Plan**

## **PHASE 1: Simplify Data Models**

### **Step 1.1: Single Template Interface**

**🔴 Test First**
```typescript
// src/types/template.test.ts
describe('Template validation', () => {
  it('should validate required fields', () => {
    expect(validateTemplate({})).toContain('Name is required');
  });
  
  it('should validate name length', () => {
    expect(validateTemplate({ name: 'a'.repeat(101) }))
      .toContain('Name too long');
  });
});
```

**🟢 Implementation**
```typescript
// src/types/template.ts
export interface Template {
  id: string;
  name: string;
  description?: string;
  messages: TemplateMessage[];
  arguments: TemplateArgument[];
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

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

// Simple validation function
export function validateTemplate(template: Partial<Template>): string[] {
  const errors: string[] = [];
  
  if (!template.name?.trim()) {
    errors.push('Name is required');
  }
  
  if (template.name && template.name.length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }
  
  if (!template.messages || template.messages.length === 0) {
    errors.push('At least one message is required');
  }
  
  return errors;
}
```

---

## **PHASE 2: Unified Service Layer**

### **Step 2.1: Single Template Service**

**🔴 Test First**
```typescript
// src/services/TemplateService.test.ts
describe('TemplateService', () => {
  let service: TemplateService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };
    service = new TemplateService(mockSupabase);
  });

  describe('create', () => {
    it('should create valid template', async () => {
      const template = {
        name: 'Test Template',
        messages: [{ role: 'user', content: 'Hello' }],
        arguments: [],
        userId: 'user-123',
        isPublic: false
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null })
      });

      const result = await service.create(template);
      expect(result.id).toBe('new-id');
    });

    it('should validate template before creating', async () => {
      const template = { name: '' }; // Invalid
      
      await expect(service.create(template))
        .rejects.toThrow('Name is required');
    });
  });

  describe('findByUser', () => {
    it('should return user templates', async () => {
      const mockData = [{ id: '1', name: 'Template 1' }];
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      const result = await service.findByUser('user-123');
      expect(result).toEqual(mockData);
    });
  });
});
```

**🟢 Implementation**
```typescript
// src/services/TemplateService.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Template, validateTemplate } from '../types/template';

export class TemplateService {
  constructor(private supabase: SupabaseClient) {}

  async create(templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
    // Validate first
    const errors = validateTemplate(templateData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const payload = {
      ...templateData,
      template_data: {
        messages: templateData.messages,
        arguments: templateData.arguments
      },
      user_id: templateData.userId,
      is_public: templateData.isPublic,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('prompt_templates')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(`Failed to create template: ${error.message}`);
    
    return this.mapFromDb(data);
  }

  async findByUser(userId: string): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
    
    return data.map(row => this.mapFromDb(row));
  }

  async findPublic(): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch public templates: ${error.message}`);
    
    return data.map(row => this.mapFromDb(row));
  }

  async findById(id: string): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch template: ${error.message}`);
    }

    return this.mapFromDb(data);
  }

  async update(id: string, updates: Partial<Template>): Promise<Template> {
    // Validate updates
    const errors = validateTemplate(updates);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('prompt_templates')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update template: ${error.message}`);
    
    return this.mapFromDb(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete template: ${error.message}`);
  }

  private mapFromDb(row: any): Template {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      messages: row.template_data?.messages || [],
      arguments: row.template_data?.arguments || [],
      isPublic: row.is_public,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
```

---

## **PHASE 3: Component Extraction**

### **Step 3.1: Extract Dashboard Components**

**🔴 Test Components**
```typescript
// src/components/Dashboard/DashboardHeader.test.tsx
describe('DashboardHeader', () => {
  it('should display user email', () => {
    const user = { email: 'test@test.com' };
    render(<DashboardHeader user={user} onSignOut={jest.fn()} onCreateNew={jest.fn()} />);
    expect(screen.getByText('Welcome, test@test.com')).toBeInTheDocument();
  });

  it('should call onCreateNew when new template clicked', () => {
    const onCreateNew = jest.fn();
    render(<DashboardHeader user={mockUser} onSignOut={jest.fn()} onCreateNew={onCreateNew} />);
    fireEvent.click(screen.getByText('New Template'));
    expect(onCreateNew).toHaveBeenCalled();
  });
});
```

**🟢 Create Small Components**
```typescript
// src/components/Dashboard/DashboardHeader.tsx
interface DashboardHeaderProps {
  user: User;
  onSignOut: () => void;
  onCreateNew: () => void;
}

export function DashboardHeader({ user, onSignOut, onCreateNew }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">MCP Prompt Manager</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
            <Button variant="outline" onClick={onSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
```

```typescript
// src/components/Dashboard/TemplateSearch.tsx
interface TemplateSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TemplateSearch({ value, onChange }: TemplateSearchProps) {
  return (
    <div className="mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search templates..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
```

```typescript
// src/components/Dashboard/TemplateGrid.tsx
interface TemplateGridProps {
  templates: Template[];
  currentUserId: string;
  loading?: boolean;
  emptyMessage?: string;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onView: (template: Template) => void;
}

export function TemplateGrid({ 
  templates, 
  currentUserId, 
  loading, 
  emptyMessage = "No templates found",
  onEdit, 
  onDelete, 
  onView 
}: TemplateGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isOwner={template.userId === currentUserId}
          onEdit={template.userId === currentUserId ? onEdit : undefined}
          onDelete={template.userId === currentUserId ? onDelete : undefined}
          onView={onView}
        />
      ))}
    </div>
  );
}
```

```typescript
// src/components/Dashboard/Dashboard.tsx (Simplified)
export function Dashboard({ user, onSignOut }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const {
    myTemplates,
    publicTemplates,
    loading,
    refetch
  } = useTemplates(user.id);

  const filteredMyTemplates = useFilteredTemplates(myTemplates, searchQuery);
  const filteredPublicTemplates = useFilteredTemplates(publicTemplates, searchQuery);

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setViewMode('editor');
  };

  // ... other handlers (simplified)

  if (viewMode === 'editor') {
    return (
      <TemplateEditor
        template={selectedTemplate}
        onSave={() => {
          setViewMode('dashboard');
          refetch();
        }}
        onCancel={() => setViewMode('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        user={user} 
        onSignOut={onSignOut} 
        onCreateNew={handleCreateNew} 
      />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <TemplateSearch value={searchQuery} onChange={setSearchQuery} />
        
        <Tabs defaultValue="my-templates">
          <TabsList>
            <TabsTrigger value="my-templates">
              My Templates ({myTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="public-templates">
              Public Templates ({publicTemplates.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-templates" className="mt-6">
            <TemplateGrid
              templates={filteredMyTemplates}
              currentUserId={user.id}
              loading={loading}
              emptyMessage="You haven't created any templates yet."
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </TabsContent>
          
          <TabsContent value="public-templates" className="mt-6">
            <TemplateGrid
              templates={filteredPublicTemplates}
              currentUserId={user.id}
              loading={loading}
              emptyMessage="No public templates available yet."
              onView={handleView}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
```

---

## **PHASE 4: Custom Hooks**

### **Step 4.1: Extract Business Logic to Hooks**

```typescript
// src/hooks/useTemplates.ts
export function useTemplates(userId: string) {
  const templateService = useTemplateService();

  const {
    data: myTemplates = [],
    isLoading: myLoading,
    refetch: refetchMy
  } = useQuery({
    queryKey: ['templates', userId],
    queryFn: () => templateService.findByUser(userId)
  });

  const {
    data: publicTemplates = [],
    isLoading: publicLoading,
    refetch: refetchPublic
  } = useQuery({
    queryKey: ['templates', 'public'],
    queryFn: () => templateService.findPublic()
  });

  return {
    myTemplates,
    publicTemplates,
    loading: myLoading || publicLoading,
    refetch: () => {
      refetchMy();
      refetchPublic();
    }
  };
}
```

```typescript
// src/hooks/useTemplateOperations.ts
export function useTemplateOperations() {
  const templateService = useTemplateService();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTemplate = useMutation({
    mutationFn: templateService.create.bind(templateService),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      toast({
        title: "Success",
        description: "Template created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Template> }) =>
      templateService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      toast({
        title: "Success", 
        description: "Template updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  const deleteTemplate = useMutation({
    mutationFn: templateService.delete.bind(templateService),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error", 
        description: error.message
      });
    }
  });

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
}
```

---

## 🎯 **Implementation Checklist**

### **Phase 1: Simplify Models** ✅ **PRIORITY 1**
- [ ] Remove all value objects (TemplateName, TemplateId, etc.)
- [ ] Remove domain entities layer
- [ ] Create simple Template interface
- [ ] Add validation function
- [ ] Update all existing tests

### **Phase 2: Unified Service** ✅ **PRIORITY 1**  
- [ ] Remove TemplateApplicationService
- [ ] Remove templateServiceAdapter
- [ ] Create single TemplateService class
- [ ] Move all operations to one place
- [ ] Add comprehensive tests

### **Phase 3: Component Extraction** ✅ **PRIORITY 2**
- [ ] Extract DashboardHeader (< 50 lines)
- [ ] Extract TemplateSearch (< 30 lines)
- [ ] Extract TemplateGrid (< 80 lines)
- [ ] Simplify main Dashboard (< 100 lines)
- [ ] Test all extracted components

### **Phase 4: Custom Hooks** ✅ **PRIORITY 2**
- [ ] Create useTemplates hook
- [ ] Create useTemplateOperations hook
- [ ] Move business logic from components
- [ ] Add hook tests

### **Phase 5: Cleanup** ✅ **PRIORITY 3**
- [ ] Remove unused files
- [ ] Remove dependency injection container
- [ ] Update imports across app
- [ ] Verify all tests pass

---

## 🚀 **Success Criteria**

### **Simplicity Metrics**
- [ ] 50%+ reduction in total lines of code
- [ ] No file > 150 lines
- [ ] No function > 20 lines
- [ ] Zero abstract classes or complex inheritance
- [ ] Single source of truth for each concept

### **Quality Metrics**
- [ ] All tests passing
- [ ] 100% test coverage on business logic
- [ ] Zero linting errors
- [ ] No code duplication
- [ ] Clear, self-documenting names

### **XP Practices**
- [ ] TDD used throughout
- [ ] Small, focused commits
- [ ] Continuous refactoring
- [ ] Simple design that works
- [ ] Easy to understand for new developers

---

## 🔄 **Benefits After Refactoring**

1. **Faster Development**: Less boilerplate, more direct code
2. **Easier Testing**: Simple functions are easy to test
3. **Better Onboarding**: New developers understand the code quickly
4. **Fewer Bugs**: Less complexity = fewer places for bugs to hide
5. **Easier Changes**: Simple code is easy to modify

---

## 📝 **Key Differences from Over-Engineered Approach**

| Over-Engineered | Simple XP Approach |
|-----------------|-------------------|
| Value Objects for everything | Simple interfaces + validation functions |
| Repository Pattern | Direct service calls to database |
| Dependency Injection Container | Direct imports and React Context |
| Domain Entities with complex logic | Plain data + business logic in services |
| Multiple service layers | One service per domain |
| Abstract interfaces everywhere | Concrete classes with clear responsibilities |

---

**Remember: We're building a prompt management app, not an enterprise banking system. Choose simplicity, and let complexity emerge only when it's truly needed.**