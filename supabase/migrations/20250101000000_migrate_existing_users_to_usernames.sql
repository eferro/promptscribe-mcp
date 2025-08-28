-- Migration: Generate default usernames for existing users and update templates
-- This script handles the transition from email-only users to username-based system

-- Step 1: Create a temporary function to generate unique usernames
CREATE OR REPLACE FUNCTION generate_unique_username_for_existing_user(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    -- Extract username from email (left side of @)
    base_username := LOWER(SPLIT_PART(user_email, '@', 1));
    
    -- Clean the username: replace invalid characters with underscores
    base_username := REGEXP_REPLACE(base_username, '[^a-zA-Z0-9_-]', '_', 'g');
    
    -- Ensure minimum length
    IF LENGTH(base_username) < 3 THEN
        base_username := 'user' || base_username;
    END IF;
    
    -- Ensure maximum length
    IF LENGTH(base_username) > 20 THEN
        base_username := LEFT(base_username, 20);
    END IF;
    
    -- Try to find a unique username
    final_username := base_username;
    
    WHILE counter < max_attempts LOOP
        -- Check if username is available
        IF NOT EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE username = final_username
        ) THEN
            RETURN final_username;
        END IF;
        
        -- Try with counter suffix
        counter := counter + 1;
        final_username := base_username || '_' || counter::TEXT;
        
        -- Ensure we don't exceed max length
        IF LENGTH(final_username) > 20 THEN
            final_username := LEFT(base_username, 20 - LENGTH(counter::TEXT) - 1) || '_' || counter::TEXT;
        END IF;
    END LOOP;
    
    -- If we still can't find a unique username, use timestamp
    RETURN base_username || '_' || EXTRACT(EPOCH FROM NOW())::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create user profiles for existing users
INSERT INTO user_profiles (user_id, username, display_name, created_at, updated_at)
SELECT 
    u.id,
    generate_unique_username_for_existing_user(u.email),
    COALESCE(u.raw_user_meta_data->>'full_name', SPLIT_PART(u.email, '@', 1)),
    u.created_at,
    u.updated_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = u.id
);

-- Step 3: Update existing templates with creator usernames
UPDATE prompt_templates 
SET created_by_username = up.username
FROM user_profiles up
WHERE prompt_templates.user_id = up.user_id
  AND prompt_templates.created_by_username IS NULL;

-- Step 4: Clean up - drop the temporary function
DROP FUNCTION generate_unique_username_for_existing_user(TEXT);

-- Step 5: Verify migration
-- This will show any users that might not have been migrated
SELECT 
    'Users without profiles' as check_type,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE up.id IS NULL

UNION ALL

-- Check templates without usernames
SELECT 
    'Templates without usernames' as check_type,
    COUNT(*) as count
FROM prompt_templates
WHERE created_by_username IS NULL;
