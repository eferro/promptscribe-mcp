# PromptScribe MCP - Autonomous AI Agent Refactoring Plan

## 🤖 **AUTONOMOUS AGENT INSTRUCTIONS**

This plan is designed for **autonomous execution** by an AI agent. Follow each step sequentially, verify completion before proceeding, and maintain strict adherence to XP principles.

---

## 🎯 **MISSION STATEMENT**

Refactor PromptScribe MCP Dashboard component following Extreme Programming (XP) principles:
- **Simplicity first**: Choose the most obvious solution
- **YAGNI**: Don't build what you don't need today  
- **Clean Code**: Small functions, meaningful names, no duplication
- **TDD**: Red → Green → Refactor for each change

**Success Criteria**: Dashboard.tsx from 276 lines → <100 lines with improved maintainability

---

## 📋 **EXECUTION CHECKLIST**

### **PHASE 1: EXTRACT DASHBOARD HEADER** ⭐ **HIGH PRIORITY**

#### **Step 1.1: Create DashboardHeader Test**
- [ ] **File**: `src/components/Dashboard/DashboardHeader.test.tsx`
- [ ] **Action**: CREATE new test file
- [ ] **Test Requirements**:
  - Should display user email correctly
  - Should call onCreateNew when "New Template" button clicked
  - Should call onSignOut when "Sign Out" button clicked
  - Should render proper UI structure

**Expected Test Code:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from './DashboardHeader';

describe('DashboardHeader', () => {
  const mockUser = { email: 'test@example.com' };
  const mockOnSignOut = jest.fn();
  const mockOnCreateNew = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display user email', () => {
    render(<DashboardHeader user={mockUser} onSignOut={mockOnSignOut} onCreateNew={mockOnCreateNew} />);
    expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument();
  });

  it('should call onCreateNew when new template clicked', () => {
    render(<DashboardHeader user={mockUser} onSignOut={mockOnSignOut} onCreateNew={mockOnCreateNew} />);
    fireEvent.click(screen.getByText('New Template'));
    expect(mockOnCreateNew).toHaveBeenCalled();
  });

  it('should call onSignOut when sign out clicked', () => {
    render(<DashboardHeader user={mockUser} onSignOut={mockOnSignOut} onCreateNew={mockOnCreateNew} />);
    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockOnSignOut).toHaveBeenCalled();
  });
});
```

#### **Step 1.2: Create DashboardHeader Directory**
- [ ] **Action**: CREATE directory `src/components/Dashboard/`
- [ ] **Verification**: Directory exists and is empty

#### **Step 1.3: Implement DashboardHeader Component** 
- [ ] **File**: `src/components/Dashboard/DashboardHeader.tsx`
- [ ] **Action**: CREATE new component
- [ ] **Requirements**:
  - Component must be < 50 lines
  - Extract header JSX from Dashboard.tsx lines 156-176
  - Add proper TypeScript interfaces
  - Import all necessary dependencies

**Expected Implementation:**
```typescript
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { User } from '@supabase/supabase-js';

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

#### **Step 1.4: Verify Tests Pass**
- [ ] **Action**: RUN tests for DashboardHeader
- [ ] **Command**: `npm test DashboardHeader`
- [ ] **Verification**: All tests pass (3/3)

#### **Step 1.5: Update Dashboard to Use DashboardHeader**
- [ ] **File**: `src/pages/Dashboard.tsx`
- [ ] **Action**: MODIFY existing file
- [ ] **Changes Required**:
  1. Add import: `import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";`
  2. Replace lines 155-176 (header JSX) with: `<DashboardHeader user={user} onSignOut={onSignOut} onCreateNew={handleCreateNew} />`
  3. Remove unused imports: `Plus`, `LogOut` (keep others)

#### **Step 1.6: Verify Dashboard Still Works**
- [ ] **Action**: RUN all Dashboard tests
- [ ] **Command**: `npm test Dashboard`
- [ ] **Verification**: All existing tests pass

---

### **PHASE 2: EXTRACT TEMPLATE GRID** ⭐ **HIGH PRIORITY**

#### **Step 2.1: Create TemplateGrid Test**
- [ ] **File**: `src/components/Dashboard/TemplateGrid.test.tsx`
- [ ] **Action**: CREATE new test file
- [ ] **Test Requirements**:
  - Should render loading state when loading=true
  - Should render empty state when templates array is empty
  - Should render template cards when templates exist
  - Should pass correct props to TemplateCard components
  - Should handle missing onEdit/onDelete props gracefully

**Expected Test Code:**
```typescript
import { render, screen } from '@testing-library/react';
import { TemplateGrid } from './TemplateGrid';
import { Template } from '@/types/template';

const mockTemplate: Template = {
  id: '1',
  name: 'Test Template',
  description: 'Test Description',
  messages: [],
  arguments: [],
  isPublic: false,
  userId: 'user-1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
};

describe('TemplateGrid', () => {
  it('should render loading state', () => {
    render(
      <TemplateGrid 
        templates={[]} 
        currentUserId="user-1" 
        loading={true}
        onView={jest.fn()}
      />
    );
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(6);
  });

  it('should render empty state with custom message', () => {
    render(
      <TemplateGrid 
        templates={[]} 
        currentUserId="user-1" 
        emptyMessage="Custom empty message"
        onView={jest.fn()}
      />
    );
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('should render template cards', () => {
    render(
      <TemplateGrid 
        templates={[mockTemplate]} 
        currentUserId="user-1" 
        onView={jest.fn()}
      />
    );
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });
});
```

#### **Step 2.2: Implement TemplateGrid Component**
- [ ] **File**: `src/components/Dashboard/TemplateGrid.tsx`
- [ ] **Action**: CREATE new component
- [ ] **Requirements**:
  - Component must be < 80 lines
  - Extract grid logic from Dashboard.tsx (lines 205-235 and 238-264)
  - Eliminate code duplication between the two tabs
  - Add proper TypeScript interfaces
  - Include LoadingGrid and EmptyState sub-components

**Expected Implementation:**
```typescript
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Template } from '@/types/template';
import TemplateCard from "@/components/templates/TemplateCard";

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
  loading = false,
  emptyMessage = "No templates found",
  onEdit, 
  onDelete, 
  onView 
}: TemplateGridProps) {
  if (loading) {
    return <LoadingGrid />;
  }

  if (templates.length === 0) {
    return <EmptyState message={emptyMessage} onCreateNew={onEdit} />;
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

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  message: string;
  onCreateNew?: (template: Template) => void;
}

function EmptyState({ message, onCreateNew }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">{message}</p>
      {onCreateNew && (
        <Button onClick={() => onCreateNew({} as Template)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Template
        </Button>
      )}
    </div>
  );
}
```

#### **Step 2.3: Create TemplateSearch Component**
- [ ] **File**: `src/components/Dashboard/TemplateSearch.tsx`
- [ ] **Action**: CREATE new component
- [ ] **Requirements**:
  - Component must be < 30 lines
  - Extract search JSX from Dashboard.tsx lines 180-191

**Expected Implementation:**
```typescript
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

#### **Step 2.4: Verify TemplateGrid Tests Pass**
- [ ] **Action**: RUN tests for TemplateGrid
- [ ] **Command**: `npm test TemplateGrid`
- [ ] **Verification**: All tests pass

---

### **PHASE 3: CREATE CUSTOM HOOKS** ⭐ **MEDIUM PRIORITY**

#### **Step 3.1: Create useTemplateSearch Hook**
- [ ] **File**: `src/hooks/useTemplateSearch.ts`
- [ ] **Action**: CREATE new hook
- [ ] **Requirements**:
  - Hook must be < 20 lines
  - Extract filtering logic from Dashboard.tsx lines 120-128
  - Use useMemo for performance

**Expected Implementation:**
```typescript
import { useMemo } from 'react';
import { Template } from '@/types/template';

export function useTemplateSearch(templates: Template[], query: string) {
  return useMemo(() => {
    if (!query.trim()) return templates;
    
    const lowercaseQuery = query.toLowerCase();
    return templates.filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description?.toLowerCase().includes(lowercaseQuery)
    );
  }, [templates, query]);
}
```

#### **Step 3.2: Create useTemplateSearch Test**
- [ ] **File**: `src/hooks/useTemplateSearch.test.ts`
- [ ] **Action**: CREATE test file

**Expected Test Code:**
```typescript
import { renderHook } from '@testing-library/react';
import { useTemplateSearch } from './useTemplateSearch';
import { Template } from '@/types/template';

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'React Template',
    description: 'For React components',
    messages: [],
    arguments: [],
    isPublic: false,
    userId: 'user-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Vue Template',
    description: 'For Vue.js applications',
    messages: [],
    arguments: [],
    isPublic: false,
    userId: 'user-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

describe('useTemplateSearch', () => {
  it('should return all templates when query is empty', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, ''));
    expect(result.current).toEqual(mockTemplates);
  });

  it('should filter templates by name', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, 'React'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('React Template');
  });

  it('should filter templates by description', () => {
    const { result } = renderHook(() => useTemplateSearch(mockTemplates, 'Vue.js'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Vue Template');
  });
});
```

---

### **PHASE 4: REFACTOR DASHBOARD** ⭐ **HIGH PRIORITY**

#### **Step 4.1: Update Dashboard Imports**
- [ ] **File**: `src/pages/Dashboard.tsx`
- [ ] **Action**: MODIFY imports section
- [ ] **Changes Required**:
  - Add: `import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";`
  - Add: `import { TemplateGrid } from "@/components/Dashboard/TemplateGrid";`
  - Add: `import { TemplateSearch } from "@/components/Dashboard/TemplateSearch";`
  - Add: `import { useTemplateSearch } from "@/hooks/useTemplateSearch";`
  - Remove: `Plus, Search, LogOut` from lucide-react import (keep others)

#### **Step 4.2: Simplify Dashboard State**
- [ ] **File**: `src/pages/Dashboard.tsx`
- [ ] **Action**: MODIFY state management
- [ ] **Changes Required**:
  - Keep only essential state: `searchQuery`, `viewMode`, `selectedTemplate`
  - Remove: `deleteDialogOpen`, `templateToDelete` (move to TemplateGrid if needed)
  - Simplify handlers to be < 5 lines each

#### **Step 4.3: Update Dashboard JSX**
- [ ] **File**: `src/pages/Dashboard.tsx`  
- [ ] **Action**: REPLACE JSX sections
- [ ] **Changes Required**:
  1. Replace header section (lines 155-176) with: `<DashboardHeader user={user} onSignOut={onSignOut} onCreateNew={handleCreateNew} />`
  2. Replace search section (lines 180-191) with: `<TemplateSearch value={searchQuery} onChange={setSearchQuery} />`
  3. Replace both TabsContent sections (lines 204-264) with TemplateGrid components
  4. Add useTemplateSearch hook usage for filtered templates

#### **Step 4.4: Expected Final Dashboard Structure**
- [ ] **Verification**: Dashboard.tsx should be approximately this structure:

```typescript
export default function Dashboard({ user, onSignOut }: DashboardProps) {
  // State (3 useState only)
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Data fetching
  const { myTemplates, publicTemplates, loading, refetch } = useTemplates(user.id);
  
  // Filtered data
  const filteredMyTemplates = useTemplateSearch(myTemplates, searchQuery);
  const filteredPublicTemplates = useTemplateSearch(publicTemplates, searchQuery);

  // Simple handlers (< 5 lines each)
  const handleCreateNew = () => { ... };
  const handleEdit = (template: Template) => { ... };
  const handleView = (template: Template) => { ... };
  const handleSave = () => { ... };

  // Conditional rendering
  if (viewMode === 'editor') return <TemplateEditor ... />;
  if (viewMode === 'viewer' && selectedTemplate) return <TemplateViewer ... />;

  // Main render
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onSignOut={onSignOut} onCreateNew={handleCreateNew} />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <TemplateSearch value={searchQuery} onChange={setSearchQuery} />
        
        <Tabs defaultValue="my-templates">
          <TabsList>...</TabsList>
          
          <TabsContent value="my-templates" className="mt-6">
            <TemplateGrid
              templates={filteredMyTemplates}
              currentUserId={user.id}
              loading={loading}
              emptyMessage="You haven't created any templates yet."
              onEdit={handleEdit}
              onDelete={deleteTemplate}
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

### **PHASE 5: TESTING & VERIFICATION** ⭐ **CRITICAL**

#### **Step 5.1: Run All Tests**
- [ ] **Action**: RUN complete test suite
- [ ] **Command**: `npm test`
- [ ] **Verification**: All tests pass (no regressions)

#### **Step 5.2: Verify Code Quality**
- [ ] **Action**: RUN linting
- [ ] **Command**: `npm run lint`
- [ ] **Verification**: No linting errors

#### **Step 5.3: Verify File Size Metrics**
- [ ] **Action**: CHECK line counts
- [ ] **Requirements**:
  - Dashboard.tsx: < 100 lines (down from 276)
  - DashboardHeader.tsx: < 50 lines
  - TemplateGrid.tsx: < 80 lines  
  - TemplateSearch.tsx: < 30 lines
  - useTemplateSearch.ts: < 20 lines

#### **Step 5.4: Manual Testing**
- [ ] **Action**: TEST application functionality
- [ ] **Verification**: 
  - Dashboard loads correctly
  - Create new template works
  - Search functionality works
  - Edit/Delete operations work
  - Tab switching works
  - No UI regressions

---

## 🎯 **SUCCESS CRITERIA CHECKLIST**

### **Code Quality Metrics**
- [ ] Dashboard.tsx: 276 lines → < 100 lines (**-68% reduction**)
- [ ] Zero code duplication in grid rendering
- [ ] All components < 50 lines (except TemplateGrid < 80 lines)
- [ ] All hooks < 30 lines
- [ ] Zero linting errors

### **Functional Requirements**  
- [ ] All existing functionality preserved
- [ ] No performance regressions
- [ ] All tests passing
- [ ] Clean component boundaries
- [ ] Proper TypeScript interfaces

### **XP Principles Verification**
- [ ] **Simplicity**: Each file has one clear responsibility
- [ ] **YAGNI**: No unnecessary abstractions added
- [ ] **Clean Code**: Meaningful names, small functions
- [ ] **TDD**: All changes test-driven
- [ ] **Easy to Change**: Modifications isolated to single files

---

## 🚨 **AGENT ERROR HANDLING**

### **If Tests Fail:**
1. **STOP** execution immediately
2. **ANALYZE** error messages carefully  
3. **FIX** the specific issue before proceeding
4. **NEVER** skip failing tests

### **If Imports Fail:**
1. **VERIFY** all file paths are correct
2. **CHECK** that all created files exist
3. **ENSURE** proper export statements

### **If Components Break:**
1. **REVERT** to previous working state
2. **IDENTIFY** specific issue
3. **FIX** incrementally
4. **RE-TEST** before proceeding

---

## 📝 **COMPLETION REPORT TEMPLATE**

After completing all phases, generate this report:

```markdown
# Refactoring Completion Report

## ✅ Completed Tasks
- [ ] DashboardHeader extracted (X lines)
- [ ] TemplateGrid extracted (X lines)  
- [ ] TemplateSearch extracted (X lines)
- [ ] useTemplateSearch hook created (X lines)
- [ ] Dashboard refactored (X lines, down from 276)

## 📊 Metrics
- **Lines of Code Reduction**: X% 
- **Components Created**: X
- **Tests Added**: X
- **Test Coverage**: X%

## 🧪 Test Results
- **Total Tests**: X passed, 0 failed
- **Linting**: 0 errors
- **Manual Testing**: All functionality verified

## 🎯 XP Principles Applied
- [x] Simplicity over complexity
- [x] YAGNI - no premature abstractions  
- [x] Clean code - small, focused components
- [x] TDD - tests written first
- [x] Easy to change - clear component boundaries
```

---

**🤖 AGENT: Execute this plan step by step. Do not skip any verification steps. Maintain working software at all times.**
