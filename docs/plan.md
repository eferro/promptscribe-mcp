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
4. [x] Introduce secure session storage
   - Migrate Supabase token storage from `localStorage` to HTTP-only cookies or similar
   - Update Supabase client and adjust affected tests
5. [x] Refactor `AuthForm` component
   - Split into `SignInForm`, `SignUpForm`, and `PasswordResetForm`
   - Extract repeated toast and state management logic
6. [x] Centralize timestamp generation in `TemplateService`
   - Create utility for generating `created_at` and `updated_at`
   - Remove duplicated `new Date().toISOString()` calls
7. [x] Simplify `validateTemplate`
   - Separate create and update validation into distinct functions
8. [x] Remove legacy `TemplateData` interface
   - Delete interface and update related code and types
9. [x] Add tests for `findByTags`
   - Verify correct filtering and error handling
10. [x] Replace `console.error` with structured logging
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
    13.2. [~] Create UsernameChangeForm component (NEEDS FIXES)
        - Form for changing username
        - Username availability checking
        - Validation and error handling
        - Success confirmation
        - ISSUES: Component interface mismatch with service, not integrated into UI
    13.3. [~] Create UserProfileForm component (NEEDS CLEANUP)
        - Form for editing profile information
        - Username change integration
        - Profile picture upload (future enhancement)
        - Bio and display name fields
        - ISSUES: Duplicate username validation logic, needs consolidation
    13.4. [x] Update DashboardHeader for username display
        - Show username instead of email
        - Add profile editing button
        - Add username change option
    13.5. [x] Update TemplateCard for username display
        - Show creator username instead of user_id
        - Add username to template metadata

14. [~] User experience and validation (PARTIALLY IMPLEMENTED)
    14.1. [~] Implement username validation rules (NEEDS FIXES)
        - Length constraints (3-20 characters) - IMPLEMENTED
        - Character restrictions (alphanumeric, underscores, hyphens) - IMPLEMENTED  
        - Reserved username prevention (admin, root, etc.) - IMPLEMENTED IN DB
        - Basic format validation - NEEDS CONSISTENCY FIXES
    14.2. [~] Implement username availability checking (NEEDS FIXES)
        - Real-time validation during typing - IMPLEMENTED BUT BUGGY
        - Debounced API calls - IMPLEMENTED
        - Clear availability indicators - NEEDS IMPROVEMENT
        - Suggested alternatives for taken usernames - NOT IMPLEMENTED
    14.3. [x] Add username change restrictions
        - SKIP: Minimum time between changes (e.g., 30 days)
        - SKIP: Change limit per year
        - Only enforce uniqueness constraint - IMPLEMENTED

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
15.4. [x] Component tests for new forms
        - Test UsernameChangeForm validation
        - Test UserProfileForm functionality
        - Test form submission and error handling
15.5. [x] Integration tests for username flow
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

17. [ ] Fix username change functionality implementation
    17.1. [x] Fix UsernameChangeForm component issues
        - PROBLEM: Component expects currentUsername but service needs userId
        - Update UsernameChangeForm.tsx to accept user object instead of currentUsername
        - Fix handleSubmit to pass user.id to UserProfileService.updateUsername
        - Add proper error handling for username conflicts
        - Ensure form validates username format (3-20 chars, alphanumeric + underscore/hyphen)
    
    17.2. [x] Fix UserProfileService.updateUsername method
        - PROBLEM: Method signature expects (userId, newUsername) but component passes (currentUsername, newUsername)  
        - Verify method correctly checks username availability with excludeUserId
        - Ensure proper error messages are returned for conflicts
        - Test edge cases (same username, empty username, invalid format)
    
    17.3. [x] Integrate UsernameChangeForm into Dashboard UI
        - PROBLEM: UsernameChangeForm is implemented but not used anywhere
        - Add username change option to Dashboard header profile menu
        - Create modal or page view for username change form
        - Update DashboardHeader component to include username change functionality
        - Handle successful username changes (update local state, refresh profile)
    
    17.4. [x] Improve UserProfileForm username handling
        - PROBLEM: UserProfileForm.tsx has duplicate username change logic
        - Consolidate username change logic to use single service method
        - Remove duplicate username availability checking code
        - Ensure consistent validation between UserProfileForm and UsernameChangeForm
        - Fix updateProfile method call to handle username changes properly
    
    17.5. [~] Verify database constraints and service validation
        - PROBLEM: Need to confirm database unique constraints work correctly
        - Test that multiple users cannot have the same username
        - Verify server-side validation matches client-side validation
        - Test username update triggers in database (for templates table)
        - [x] Confirm case-sensitivity handling for usernames
    
    17.6. [ ] Add comprehensive error handling and user feedback
        - Add specific error messages for different username validation failures
        - Implement loading states during username availability checks
        - Add success animations/feedback for successful username changes
        - Handle network errors gracefully during username operations
        - Add username format hints and validation feedback in real-time

18. [ ] Documentation and user guidance
    18.1. [ ] Update user documentation
        - Username creation guidelines
        - Username change process
        - Profile management instructions
    18.2. [ ] Update developer documentation
        - API changes documentation
        - Database schema updates
        - Component usage examples
    18.3. [ ] Create admin documentation
        - Username conflict resolution
        - User profile management tools
        - Monitoring and maintenance procedures

