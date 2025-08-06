# Production Fixes Implementation Plan

> **Target Timeline**: 2-3 weeks  
> **Priority**: CRITICAL - Required before production deployment  
> **Estimated Effort**: 40-60 development hours

## 🎯 Implementation Strategy

This plan addresses the critical production issues identified in the [Production Failure Analysis](./production-failure-analysis.md) using a phased approach prioritized by risk level and implementation complexity.

## Phase 1: Critical Infrastructure (Week 1)

### 1.1 Error Boundaries Implementation
**Priority**: CRITICAL | **Effort**: 4 hours | **Risk Reduction**: 90%

#### Root Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Add error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              We're sorry, but something unexpected happened.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Implementation Steps:
1. Create `ErrorBoundary` component
2. Wrap `App` component in `main.tsx`
3. Add component-level boundaries for async operations
4. Test error scenarios

### 1.2 Fix Authentication Race Condition
**Priority**: CRITICAL | **Effort**: 3 hours | **Risk Reduction**: 85%

#### Updated Index.tsx
```typescript
// src/pages/Index.tsx
useEffect(() => {
  let isMounted = true;
  
  const initializeAuth = async () => {
    try {
      // Get initial session first
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  // Set up auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    }
  );

  // Initialize auth state
  initializeAuth();

  return () => {
    isMounted = false;
    subscription.unsubscribe();
  };
}, []);
```

### 1.3 Environment Variables Security
**Priority**: CRITICAL | **Effort**: 2 hours | **Risk Reduction**: 75%

#### Environment Setup
1. Create `.env.local` file:
```bash
VITE_SUPABASE_URL=https://fdtotoxhicqhoulckkgj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Update `client.ts`:
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

3. Add to `.gitignore`:
```
.env.local
.env
```

## Phase 2: Memory Management & Async Operations (Week 1-2)

### 2.1 Implement AbortController Pattern
**Priority**: HIGH | **Effort**: 6 hours | **Risk Reduction**: 80%

#### Custom Hook for Cancellable Requests
```typescript
// src/hooks/useAbortController.ts
import { useEffect, useRef } from 'react';

export function useAbortController() {
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const getSignal = () => abortControllerRef.current?.signal;
  
  return { getSignal };
}
```

#### Updated Dashboard with Cancellation
```typescript
// src/pages/Dashboard.tsx
const Dashboard = ({ user, onSignOut }: DashboardProps) => {
  const { getSignal } = useAbortController();
  
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const signal = getSignal();
      
      // Create promise that can be cancelled
      const fetchUserTemplates = supabase
        .from('prompt_templates')
        .select('*')
        .eq('user_id', user.id)
        .abortSignal(signal);
        
      const fetchPublicTemplates = supabase
        .from('prompt_templates')
        .select('*')
        .eq('is_public', true)
        .abortSignal(signal);

      const [userResult, publicResult] = await Promise.all([
        fetchUserTemplates,
        fetchPublicTemplates
      ]);

      if (userResult.error) throw userResult.error;
      if (publicResult.error) throw publicResult.error;

      setMyTemplates(userResult.data || []);
      setPublicTemplates(publicResult.data || []);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load templates"
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // ... rest of component
};
```

### 2.2 Fix Toast Hook Memory Leaks
**Priority**: HIGH | **Effort**: 2 hours | **Risk Reduction**: 65%

```typescript
// src/hooks/use-toast.ts - Updated cleanup
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// Add cleanup function
export const clearAllToastTimeouts = () => {
  toastTimeouts.forEach(timeout => clearTimeout(timeout));
  toastTimeouts.clear();
};

// Update useToast hook
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      // Clear timeouts when component unmounts
      clearAllToastTimeouts();
    };
  }, []);
  
  // ... rest of hook
}
```

## Phase 3: Input Validation & State Management (Week 2)

### 3.1 Implement Zod Validation
**Priority**: HIGH | **Effort**: 4 hours | **Risk Reduction**: 70%

#### Install Dependencies
```bash
npm install zod @hookform/resolvers
```

#### Template Validation Schema
```typescript
// src/lib/validation.ts
import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string()
    .min(1, "Template name is required")
    .max(100, "Template name too long"),
  description: z.string()
    .max(500, "Description too long")
    .optional(),
  arguments: z.array(z.object({
    name: z.string()
      .min(1, "Argument name required")
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid argument name"),
    description: z.string().max(200).optional(),
    required: z.boolean()
  })),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1, "Message content required")
  })).min(1, "At least one message required")
});

export const authSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long")
});
```

#### Updated TemplateEditor with Validation
```typescript
// src/components/templates/TemplateEditor.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { templateSchema } from '@/lib/validation';

export default function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const form = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      arguments: template?.template_data?.arguments || [],
      messages: template?.template_data?.messages || [{ role: 'user', content: '{{prompt}}' }]
    }
  });

  const handleSave = async (data: any) => {
    setLoading(true);
    
    try {
      // Validation is handled by react-hook-form + zod
      const validatedData = templateSchema.parse(data);
      
      // ... rest of save logic
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        error.errors.forEach(err => {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: err.message
          });
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // ... rest of component
}
```

### 3.2 Coordinate Loading States
**Priority**: MEDIUM | **Effort**: 3 hours | **Risk Reduction**: 60%

```typescript
// src/hooks/useLoadingStates.ts
import { useState } from 'react';

type LoadingState = Record<string, boolean>;

export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  };

  const isLoading = (key: string) => loadingStates[key] || false;
  const isAnyLoading = () => Object.values(loadingStates).some(Boolean);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates
  };
}
```

## Phase 4: Configuration & Testing (Week 2-3)

### 4.1 Environment Validation
**Priority**: MEDIUM | **Effort**: 2 hours | **Risk Reduction**: 45%

```typescript
// src/lib/config.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  MODE: z.enum(['development', 'production', 'test']).optional()
});

export const config = (() => {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
})();
```

### 4.2 Fix Test Configuration
**Priority**: MEDIUM | **Effort**: 2 hours | **Risk Reduction**: 40%

#### Update vitest.config.ts
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 4.3 Network Error Handling
**Priority**: MEDIUM | **Effort**: 4 hours | **Risk Reduction**: 55%

```typescript
// src/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

## Implementation Checklist

### Phase 1: Critical Infrastructure ✓
- [ ] Create `ErrorBoundary` component
- [ ] Fix authentication race condition in `Index.tsx`
- [ ] Move API keys to environment variables
- [ ] Add environment validation
- [ ] Test error scenarios

### Phase 2: Memory Management ✓
- [ ] Implement `useAbortController` hook
- [ ] Update `Dashboard` with request cancellation
- [ ] Fix toast hook memory leaks
- [ ] Update all async components with cleanup

### Phase 3: Validation & State ✓
- [ ] Install Zod and form resolver
- [ ] Create validation schemas
- [ ] Update `TemplateEditor` with validation
- [ ] Update `AuthForm` with validation
- [ ] Implement coordinated loading states

### Phase 4: Configuration & Testing ✓
- [ ] Add environment configuration validation
- [ ] Fix Vitest configuration
- [ ] Run all existing tests
- [ ] Add network status handling
- [ ] Add retry logic for failed requests

## Testing Strategy

### Unit Tests
- Error boundary behavior
- Validation schemas
- Hook functionality
- Network error scenarios

### Integration Tests
- Authentication flow
- Template CRUD operations
- Error handling paths
- Memory leak prevention

### Manual Testing
- Rapid component mounting/unmounting
- Network disconnection scenarios
- Invalid input handling
- Authentication state changes

## Deployment Checklist

### Pre-deployment Verification
- [ ] All critical fixes implemented
- [ ] Tests passing
- [ ] Error boundaries tested
- [ ] Environment variables configured
- [ ] Memory leak testing completed
- [ ] Performance testing passed

### Post-deployment Monitoring
- [ ] Error rate monitoring
- [ ] Memory usage monitoring  
- [ ] Authentication success rate
- [ ] User experience metrics

## Success Metrics

### Technical Metrics
- Error rate < 0.1%
- Memory usage stable over time
- Authentication success rate > 99%
- Zero unhandled promise rejections

### Business Metrics
- User session duration increase
- Reduced support tickets
- Improved user satisfaction scores
- Lower bounce rate

---

**Estimated Total Effort**: 40-60 hours  
**Timeline**: 2-3 weeks  
**Risk Reduction**: 75-85% of critical issues resolved

This implementation plan prioritizes the highest-risk issues first and provides concrete solutions with code examples for each problem identified in the production analysis.