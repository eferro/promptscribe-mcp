# Development Tasks Plan

1. [x] Standardize environment variables
   - Rename keys in `.env.example` and code to use consistent `VITE_` prefix
   - Update documentation and references
2. [x] Strengthen TypeScript configuration
   - Enable `strict`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`
   - Fix resulting compilation errors using TDD
3. [x] Reactivate critical lint rules
   - Enable `@typescript-eslint/no-unused-vars`
   - Remove unused variables across the codebase
4. [ ] Introduce secure session storage
   - Migrate Supabase token storage from `localStorage` to HTTP-only cookies or similar
   - Update Supabase client and adjust affected tests
5. [ ] Refactor `AuthForm` component
   - Split into `SignInForm`, `SignUpForm`, and `PasswordResetForm`
   - Extract repeated toast and state management logic
6. [ ] Centralize timestamp generation in `TemplateService`
   - Create utility for generating `created_at` and `updated_at`
   - Remove duplicated `new Date().toISOString()` calls
7. [ ] Simplify `validateTemplate`
   - Separate create and update validation into distinct functions
8. [ ] Remove legacy `TemplateData` interface
   - Delete interface and update related code and types
9. [ ] Add tests for `findByTags`
   - Verify correct filtering and error handling
10. [ ] Replace `console.error` with structured logging
   - Implement configurable logging utility
   - Replace `console.error` usages in services and pages

