# Deployment: Supabase Migrations via GitHub Actions

This project deploys the frontend to GitHub Pages and runs Supabase database migrations automatically in CI.

## What the pipeline does
- Builds and tests the app
- Runs all pending Supabase migrations from `supabase/migrations` on the target project
- Deploys the built site to GitHub Pages

## Required GitHub Secrets
Configure these repository secrets in GitHub → Settings → Secrets and variables → Actions → New repository secret:

- `SUPABASE_ACCESS_TOKEN` (required)
  - A personal access token created from the Supabase Dashboard (Account → Access Tokens)
  - Scope: project access to run `supabase link` and `supabase db push`

- `SUPABASE_PROJECT_REF` (required)
  - The project reference ID (e.g., `fdtotoxhicqhoulckkgj`)
  - You can find it in `supabase/config.toml` (project_id) or in the Supabase Dashboard URL

- `SUPABASE_DB_PASSWORD` (required)
  - The database password for your Supabase project (Settings → Database → Connection Info)
  - Needed by Supabase CLI to run migrations

- `VITE_SUPABASE_URL` (recommended)
  - The public URL of your Supabase project (Project Settings → API)
  - Used at build-time for the frontend

- `VITE_SUPABASE_ANON_KEY` (recommended)
  - The public anon key (Project Settings → API)
  - Used at build-time for the frontend

## How migrations are executed
The workflow `.github/workflows/deploy.yml` contains a `migrate` job that:
1. Installs Supabase CLI
2. Links to your Supabase project using the provided secrets
3. Executes `supabase db push --include-all`

This applies all SQL files under `supabase/migrations` that have not been applied yet to the target database.

## Verifying migrations
After a successful run:
- Check Supabase Dashboard → Database → Migrations
- Optionally run the verification SQL we included, e.g. `supabase/migrations/20250101000000_migrate_existing_users_to_usernames_verify.sql`

## Rollback
If you need to rollback username-related data:
- Review and (carefully) execute `supabase/migrations/20250101000000_migrate_existing_users_to_usernames_rollback.sql` in a safe environment

## Local dry-run (optional)
You can test locally before pushing:
```bash
# Install CLI
npm i -g supabase

# Link project (one-time)
export SUPABASE_ACCESS_TOKEN=... 
supabase link --project-ref <PROJECT_REF> --access-token $SUPABASE_ACCESS_TOKEN --password <DB_PASSWORD>

# Apply migrations
supabase db push --include-all
```

## Notes
- The `deploy` job now depends on both `build` and `migrate` jobs and only runs on pushes to `main`.
- Ensure your DB IP allowlist (if any) permits GitHub Actions runners, or use the Supabase connection via CLI which handles this.
- Never commit secrets. Use GitHub Actions secrets as shown above.
