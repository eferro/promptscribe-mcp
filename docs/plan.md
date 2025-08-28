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

## Username Functionality Implementation

11. [x] Database schema updates for username support
    11.1. [x] Create migration for user_profiles table
        - Add table with user_id, username, display_name, bio, avatar_url
        - Add unique constraint on username
        - Add check constraints for username validation (length, format)
    11.2. [x] Create migration for username_history table (SKIP - no audit trail needed)
        - SKIP: Track username changes with timestamps
        - SKIP: Reference user_id and old/new username values
    11.3. [x] Update prompt_templates table to reference username
        - Add created_by_username column
        - Update existing records with placeholder values
        - Create trigger to auto-populate username on template creation

12. [x] Backend services and API updates
    12.1. [x] Extend Supabase types for new tables
        - Update Database type definitions
        - Add user_profiles types (skip username_history)
        - Update prompt_templates types
    12.2. [x] Create UserProfileService
        - Implement createProfile method
        - Implement updateUsername method with validation
        - Implement getProfileByUserId method
        - Implement getProfileByUsername method
        - Add username availability checking
    12.3. [x] Update AuthService for username capture
        - Modify signUp to accept username parameter
        - Create user profile after successful signup
        - Handle username conflicts during signup
    12.4. [x] Update TemplateService for username integration
        - Modify createTemplate to include username
        - Update template queries to include creator username
        - Update template display methods

13. [x] Frontend components and forms
    13.1. [x] Update AuthForm for username capture
        - Add username field to signup form
        - Add real-time username availability checking
        - Add username validation and error messages
        - Update form submission to include username
    13.2. [x] Create UsernameChangeForm component
        - Form for changing username
        - Username availability checking
        - Validation and error handling
        - Success confirmation
    13.3. [x] Create UserProfileForm component
        - Form for editing profile information
        - Username change integration
        - Profile picture upload (future enhancement)
        - Bio and display name fields
    13.4. [x] Update DashboardHeader for username display
        - Show username instead of email
        - Add profile editing button
        - Add username change option
    13.5. [x] Update TemplateCard for username display
        - Show creator username instead of user_id
        - Add username to template metadata

14. [ ] User experience and validation
    14.1. [ ] Implement username validation rules
        - Length constraints (3-20 characters)
        - Character restrictions (alphanumeric, underscores, hyphens)
        - Reserved username prevention (admin, root, etc.)
        - Basic format validation
    14.2. [ ] Implement username availability checking
        - Real-time validation during typing
        - Debounced API calls
        - Clear availability indicators
        - Suggested alternatives for taken usernames
    14.3. [ ] Add username change restrictions
        - SKIP: Minimum time between changes (e.g., 30 days)
        - SKIP: Change limit per year
        - Only enforce uniqueness constraint

15. [x] Testing and quality assurance
    15.1. [x] Unit tests for UserProfileService
        - Test username creation and validation
        - Test username update logic (no time restrictions)
        - Test conflict resolution and uniqueness
        - Test profile retrieval methods
    15.2. [x] Unit tests for updated AuthService
        - Test signup with username
        - Test username conflict handling
        - Test profile creation flow
    15.3. [x] Unit tests for updated TemplateService
        - Test template creation with username
        - Test username display in templates
    15.4. [ ] Component tests for new forms
        - Test UsernameChangeForm validation
        - Test UserProfileForm functionality
        - Test form submission and error handling
    15.5. [ ] Integration tests for username flow
        - Test complete signup with profile creation
        - Test username change workflow
        - Test template creation with username

16. [x] Migration and deployment
    16.1. [x] Create data migration scripts
        - Generate default usernames from email (left side of @)
        - Handle conflicts by adding numeric suffix (e.g., user_1, user_2)
        - Update existing templates with username references
        - Handle edge cases and data integrity
    16.2. [x] Update environment configuration
        - Add username validation settings
        - Configure username change restrictions
        - Set up monitoring for username conflicts
    16.3. [x] Create rollback plan
        - Database rollback procedures
        - Code rollback procedures
        - Data recovery procedures

17. [ ] Documentation and user guidance
    17.1. [ ] Update user documentation
        - Username creation guidelines
        - Username change process
        - Profile management instructions
    17.2. [ ] Update developer documentation
        - API changes documentation
        - Database schema updates
        - Component usage examples
    17.3. [ ] Create admin documentation
        - Username conflict resolution
        - User profile management tools
        - Monitoring and maintenance procedures

