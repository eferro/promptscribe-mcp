-- Rollback script for username migration
-- WARNING: This will remove all username-related data added during migration
-- Only use if you need to completely revert the username functionality

-- Step 1: Remove username data from templates
UPDATE prompt_templates 
SET created_by_username = NULL
WHERE created_by_username IS NOT NULL;

-- Step 2: Remove all user profiles (this will cascade to username_history)
DELETE FROM user_profiles;

-- Step 3: Verify rollback
-- This should show 0 for all counts if rollback was successful
SELECT 
    'Users with profiles' as check_type,
    COUNT(*) as count
FROM user_profiles

UNION ALL

SELECT 
    'Templates with usernames' as check_type,
    COUNT(*) as count
FROM prompt_templates
WHERE created_by_username IS NOT NULL

UNION ALL

SELECT 
    'Username history records' as check_type,
    COUNT(*) as count
FROM username_history;
