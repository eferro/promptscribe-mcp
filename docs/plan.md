# Project Plan

## 0. Critical Fixes (Immediate)

### 0.1 Secure Environment Configuration for Supabase (Vite)
- Create `.env.local` with:
  - `VITE_SUPABASE_URL=`
  - `VITE_SUPABASE_ANON_KEY=`
- Update `src/integrations/supabase/client.ts` to read from `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY` and throw if missing.
- Remove broad inlining of all env variables in `vite.config.ts` (`define: { 'process.env': env }`). Only use Vite `import.meta.env` and rely on `VITE_*` prefix.
- Ensure CI/CD injects `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for builds.
- Document env setup in `README.md` and add `.env.local`/`.env` to `.gitignore`.

### 0.2 Fix Template Deletion Flow in `TemplateEditor`
- Implement a correct `confirmDelete` handler that invokes `onDelete(template)` and closes the dialog.
- Ensure `DeleteConfirmDialog` receives `open`, `onOpenChange`, and `onConfirm` with the fixed handler.
- Add a unit test to assert that clicking confirm triggers delete and closes the dialog.
- Manually verify delete works from both owner cards and the editor screen.

## 1. Move Supabase Credentials to Environment Variables (Vite-compliant)
- Create `.env.local` file(s) and define `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Update code to load these values from `import.meta.env` in the browser bundle.
- Remove reliance on `process.env` in client-side code; do not inline non-`VITE_*` variables.
- Ensure development and deployment pipelines pass `VITE_*` variables; use `dotenv` locally only for tooling if needed.
- Document the environment setup in the `README` and ensure `.env.local` is gitignored.

## 2. Introduce Strong Typing for Template Data
- Define a `TemplateData` interface/type describing arguments and messages.
- Replace all `any` references of `template_data` with the new type.
- Update functions/components to use typed properties and fix any resulting type errors.
- Add unit tests or type tests to validate the interface usage.

## 3. Create a Supabase Service Layer
- Identify all direct Supabase calls across components.
- Create service modules (e.g., `templateService`, `authService`) encapsulating these calls.
- Export minimal, well-named functions from each service.
- Refactor components to consume the new services rather than calling Supabase directly.
- Add tests for service functions to ensure behavior remains intact.

## 4. Break Up Oversized Components
- Determine logical subcomponents inside `Dashboard` and `TemplateEditor` (e.g., search bar, message list).
- Move corresponding JSX and logic into new component files.
- Pass needed props and callbacks to maintain behavior.
- Update imports and verify layout and functionality still work.

## 5. Use a Form Library for TemplateEditor and AuthForm
- Introduce a form library (e.g., `react-hook-form`) and install dependencies.
- Replace `useState`/manual validation with form library hooks.
- Define validation rules using the library’s built-in mechanisms.
- Refactor submit handlers to use form library’s APIs.
- Add tests to cover validation and submission flows.

## 6. Centralize Authentication Logic
- Create a `useAuth` hook or `AuthProvider` context managing Supabase session.
- Move session initialization and listener setup from page components into this provider.
- Replace direct session handling in pages (e.g., `Index`) with context calls.
- Ensure cleanup/disposal happens in the provider.
- Update tests to mock/use the new auth context.

## 7. Create Helper Utilities for Toast/Error Handling
- Identify repeated toast/error patterns across components.
- Create a utility module exposing functions like `showSuccessToast`, `showErrorToast`.
- Replace inline toast calls with utility functions.
- Ensure consistent message formats and default behaviors.
- Add tests verifying utility functions produce expected toasts.

## 8. Simplify Array State Updates in TemplateEditor
- Analyze duplicated add/remove/update functions for arguments and messages.
- Create a generic helper or custom hook for array state manipulation.
- Replace current functions with the new helper to manage both arrays.
- Validate that state updates still behave correctly.

## 9. Wrap State-Changing Test Code in `act`
- Locate tests that trigger React state updates.
- Wrap these updates in `act` calls to remove warnings.
- Re-run tests to confirm warnings disappear and results remain correct.
- Document the need to use `act` in future tests.

## 10. Clarify TemplateData Serialization and Validation
- Introduce a schema (e.g., with Zod) defining the structure of template arguments and messages.
- Validate template data against the schema before saving or sending to Supabase.
- Refactor existing manual checks to rely on the schema.
- Add tests confirming invalid data is caught and valid data passes.
- Document how developers can extend the schema for new fields.