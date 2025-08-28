# Username Migration Guide

This guide explains how to migrate your existing Supabase project to include username functionality.

## 📋 Prerequisites

- Supabase project with existing users and templates
- Access to Supabase dashboard or CLI
- Backup of your production database (recommended)

## 🚀 Migration Steps

### Step 1: Run Schema Migrations

First, run the schema migrations in order:

```bash
# 1. Create user profiles table
supabase db push --include-all

# 2. Add username to templates
supabase db push --include-all

# 3. Create username history table (optional)
supabase db push --include-all
```

### Step 2: Run Data Migration

Execute the main migration script to generate usernames for existing users:

```bash
# Run the migration script
psql -h your-project-ref.supabase.co -U postgres -d postgres -f 20250101000000_migrate_existing_users_to_usernames.sql
```

**⚠️ Important**: This script will:
- Generate unique usernames for all existing users
- Update existing templates with creator usernames
- Handle conflicts by adding numeric suffixes

### Step 3: Configure Username Settings

Run the configuration script:

```bash
psql -h your-project-ref.supabase.co -U postgres -d postgres -f 20250101000001_configure_username_validation.sql
```

This creates:
- Configuration table for username settings
- Validation functions
- Permission checking functions

### Step 4: Verify Migration

Run the verification script to ensure everything worked:

```bash
psql -h your-project-ref.supabase.co -U postgres -d postgres -f 20250101000000_migrate_existing_users_to_usernames_verify.sql
```

Expected output:
```
✅ Users without profiles: 0
✅ Profiles with invalid usernames: 0
✅ Templates without creator usernames: 0
✅ Duplicate usernames: 0
```

### Step 5: Test Migration

Run the test script to verify functions work correctly:

```bash
psql -h your-project-ref.supabase.co -U postgres -d postgres -f 20250101000002_test_migration_scripts.sql
```

## 🔧 Configuration Options

The migration creates a `username_config` table with these settings:

| Key | Default | Description |
|-----|---------|-------------|
| `min_length` | 3 | Minimum username length |
| `max_length` | 20 | Maximum username length |
| `allowed_pattern` | `^[a-zA-Z0-9_-]+$` | Regex for allowed characters |
| `reserved_names` | `admin,root,system...` | Reserved usernames |
| `change_cooldown_hours` | 0 | Hours between username changes |
| `enable_history` | false | Track username change history |

## 📊 Migration Results

After migration, you'll have:

1. **User Profiles**: All users will have profiles with generated usernames
2. **Template Usernames**: All templates will show creator usernames
3. **Validation**: Server-side username validation
4. **Configuration**: Flexible username settings

## 🚨 Rollback Instructions

If you need to rollback:

```bash
# Run the rollback script
psql -h your-project-ref.supabase.co -U postgres -d postgres -f 20250101000000_migrate_existing_users_to_usernames_rollback.sql
```

**⚠️ Warning**: This will remove ALL username data and cannot be undone.

## 🔍 Troubleshooting

### Common Issues

1. **Username conflicts**: The migration handles this automatically with suffixes
2. **Invalid characters**: Emails with special characters are cleaned automatically
3. **Short usernames**: Emails shorter than 3 characters get "user" prefix

### Verification Queries

Check migration status:

```sql
-- Count users without profiles
SELECT COUNT(*) FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE up.id IS NULL;

-- Count templates without usernames
SELECT COUNT(*) FROM prompt_templates
WHERE created_by_username IS NULL;

-- Check for duplicate usernames
SELECT username, COUNT(*) FROM user_profiles
GROUP BY username HAVING COUNT(*) > 1;
```

### Performance Notes

- Migration runs in batches to avoid timeouts
- Large user bases may take several minutes
- Monitor database performance during migration

## 📝 Post-Migration Tasks

1. **Update Frontend**: Ensure your app uses the new username fields
2. **Test Functionality**: Verify username creation, changes, and display
3. **Monitor Logs**: Check for any errors in the migration process
4. **User Communication**: Inform users about their new usernames

## 🆘 Support

If you encounter issues:

1. Check the verification script output
2. Review database logs for errors
3. Ensure all migrations ran in order
4. Verify database permissions

## 📈 Monitoring

After migration, monitor:

- Username creation success rate
- Template username population
- User profile creation
- Any validation errors

---

**Migration completed successfully!** 🎉

Your Supabase project now supports usernames with full validation, configuration, and migration capabilities.
