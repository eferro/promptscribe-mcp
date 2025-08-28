-- Verification script for username migration
-- Run this after the migration to ensure everything worked correctly

-- Check 1: All users should have profiles
SELECT 
    'Users without profiles' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '❌ FAIL - Some users are missing profiles'
    END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE up.id IS NULL

UNION ALL

-- Check 2: All profiles should have valid usernames
SELECT 
    'Profiles with invalid usernames' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '❌ FAIL - Some profiles have invalid usernames'
    END as status
FROM user_profiles
WHERE username IS NULL 
   OR LENGTH(username) < 3 
   OR LENGTH(username) > 20
   OR username !~ '^[a-zA-Z0-9_-]+$'

UNION ALL

-- Check 3: All templates should have creator usernames
SELECT 
    'Templates without creator usernames' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '❌ FAIL - Some templates are missing creator usernames'
    END as status
FROM prompt_templates
WHERE created_by_username IS NULL

UNION ALL

-- Check 4: Username uniqueness
SELECT 
    'Duplicate usernames' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '❌ FAIL - Duplicate usernames found'
    END as status
FROM (
    SELECT username, COUNT(*) as cnt
    FROM user_profiles
    GROUP BY username
    HAVING COUNT(*) > 1
) duplicates

UNION ALL

-- Check 5: Sample of generated usernames
SELECT 
    'Sample usernames generated' as check_type,
    COUNT(*) as count,
    'Sample: ' || STRING_AGG(username, ', ' ORDER BY username LIMIT 5) as status
FROM user_profiles
LIMIT 1;

-- Additional detailed checks
-- Show username distribution by length
SELECT 
    'Username length distribution' as info,
    LENGTH(username) as length,
    COUNT(*) as count
FROM user_profiles
GROUP BY LENGTH(username)
ORDER BY length;

-- Show username patterns
SELECT 
    'Username patterns' as info,
    CASE 
        WHEN username ~ '^[a-z]+$' THEN 'All lowercase letters'
        WHEN username ~ '^[a-z0-9]+$' THEN 'Letters and numbers'
        WHEN username ~ '^[a-z0-9_]+$' THEN 'Letters, numbers, underscores'
        WHEN username ~ '^[a-z0-9_-]+$' THEN 'Letters, numbers, underscores, hyphens'
        WHEN username ~ '_[0-9]+$' THEN 'With numeric suffix'
        ELSE 'Other pattern'
    END as pattern,
    COUNT(*) as count
FROM user_profiles
GROUP BY pattern
ORDER BY count DESC;
